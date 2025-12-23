import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const apiHost = "http://localhost:8080";
  const emptyUserData = {
    isLoggedIn: false,
    token: null,
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: { country: "", city: "" },
    favoriteItems: [],
    cartItems: [],
  };

  const [user, setUser] = useState(emptyUserData);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          ...emptyUserData,
          ...parsed,
          cartItems: Array.isArray(parsed.cartItems)
            ? parsed.cartItems
            : Array.isArray(parsed.cartitems)
            ? parsed.cartitems
            : [],
          favoriteItems: Array.isArray(parsed.favoriteItems)
            ? parsed.favoriteItems
            : Array.isArray(parsed.favoriteitems)
            ? parsed.favoriteitems
            : [],
        });
      } catch {
        setUser(emptyUserData);
      }
    } else {
      setUser(emptyUserData);
    }

    const storedCartData = localStorage.getItem("cartData");
    if (storedCartData) {
      try {
        setCartData(JSON.parse(storedCartData));
      } catch {
        setCartData([]);
      }
    } else {
      setCartData([]);
    }
  }, []);


  const updateUser = (property, value, action = "set") => {
    setUser((prevUser) => {
      let updatedUser = { ...prevUser };

      if (property === "cartItems" || property === "favoriteItems") {
        const oldItems = Array.isArray(prevUser[property])
          ? prevUser[property]
          : [];
        const newItems = Array.isArray(value) ? value : [value];

        if (action === "add") {
          updatedUser[property] = Array.from(
            new Set([...oldItems, ...newItems])
          );
        } else if (action === "remove") {
          updatedUser[property] = oldItems.filter(
            (id) => !newItems.includes(id)
          );
        } else {
          updatedUser[property] = newItems;
        }
      } else {
        updatedUser[property] = value;
      }

      localStorage.setItem("userData", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

const updateCartData = (newData, action = "set") => {
  setCartData((prev) => {
    let updated = [];
    if (action === "set") {
      updated = Array.isArray(newData) ? newData : [];

    } else if (action === "add") {
      updated = [...prev, ...(Array.isArray(newData) ? newData : [newData])];
      updated = Array.from(new Set(updated.map(JSON.stringify))).map(JSON.parse);
    } else if (action === "remove") {
      const removeIds = Array.isArray(newData)
        ? newData.map((x) => x.itemid)
        : [newData.itemid];
      updated = prev.filter((x) => !removeIds.includes(x.itemid));

    } else if (action === "replace") {
      const itemsToReplace = Array.isArray(newData) ? newData : [newData];

      updated = prev.map((item) => {
        const replacement = itemsToReplace.find((x) => x.itemid === item.itemid);
        return replacement ? replacement : item;
      });

      itemsToReplace.forEach((item) => {
        if (!updated.some((x) => x.itemid === item.itemid)) {
          updated.push(item);
        }
      });
    }
    localStorage.setItem("cartData", JSON.stringify(updated));
    return updated;
  });
};


  const clearUserFromStorage = () => {
    localStorage.setItem("userData", JSON.stringify(emptyUserData));
    setUser(emptyUserData);
    setCartData([]);
    window.dispatchEvent(new Event("cartChanged"));
  };

  const mergeUserData = (UserJson) => {
    const existingData = JSON.parse(localStorage.getItem("userData"));
    const userData = JSON.parse(UserJson);
    if (!userData.cartItems || userData.cartItems.length === 0) {
      userData.cartItems = [];
    }
    const diff = [
      ...new Set([
        ...existingData.cartItems.filter(
          (x) => !userData.cartItems.includes(x)
        ),
      ]),
    ];
    diff.forEach(async (id) => {
      const index = cartData.findIndex(c => c.id === id);
      const exists = index !== -1;
      const itemQuantity = exists ? cartData[index].quantity : 1;
      await addToCart({ id: 1, userid: userData.id, itemid: id, quantity: itemQuantity });
    });
    if(diff.length > 0) toast.info(`${diff.length} פריטים נוספו לסל`, { autoClose: 2000 });
    userData.cartItems = mergeUniqueNumbers(
      existingData.cartItems,
      userData.cartItems
    );
    userData.favoriteItems = mergeUniqueNumbers(
      existingData.favoriteItems,
      userData.favoriteItems
    );
    return userData;
  };
  const login = async (email, password, callback) => {
    try {
      const res = await fetch(`${apiHost}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ההתחברות נכשלה");

      if (data.success) {
        const userData = mergeUserData(data.message);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser({ ...userData, isLoggedIn: true });
        toast.success(
          `שלום ${userData.firstname} ${userData.lastname} התחברת בהצלחה`,
          {
            onClose: () => {
              if(callback) callback();
            },
            autoClose: 2000,
          }
        );
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const doLogout = async () => {
    if (localStorage.getItem("serverStatus") === "online") {
      try {
        const userData = localStorage.getItem("userData");
        const res = await fetch(`${apiHost}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: userData,
        });
        if (!res.ok) return false;
        const logoutResponse = await res.json();
        if (logoutResponse.success) {
          clearUserFromStorage();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else if (localStorage.getItem("userData")) {
      clearUserFromStorage();
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (await doLogout()) {
      toast.info("התנתקת בהצלחה!", { autoClose: 2000 });
    } else {
      clearUserFromStorage();
      toast.error("התנתקות נכשלה.");
    }
  };
  const mergeUniqueNumbers = (arr1 = [], arr2 = []) => {
    return [...new Set([...arr1, ...arr2])];
  };

  const disableDiv = (div, disabled = true) => {
    if(!div) return;
    if (disabled) {
      div.setAttribute("disabled", "disabled");
    } else {
      div.removeAttribute("disabled");
    }
  };

  const isDivDisabled = (div) => div.hasAttribute("disabled");

  const addToCart = async (item, div, quantity = 1) => {
    const cartItem = asCartItem(item, quantity);
    if(user.isLoggedIn) {
      disableDiv(div);
      const res = await fetch(`${apiHost}/api/cart/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cartItem),
      });
      disableDiv(div, false);
      if(!res.ok) return false;
      const data = await res.json();
      if(data.success) addToCartLocal(cartItem);
      return data.success;
    } else {
      addToCartLocal(cartItem);
      return true;
    }
  };

  const updateCartItem = async (item, quantity = 1) => {
      const existInCart = user?.cartItems?.includes(item.id) || false;
      if(!existInCart) await addToCart(item, null, quantity);
      const cartItem = asCartItem(item, quantity);
      if(user.isLoggedIn) {
        const res = await fetch(`${apiHost}/api/cart/${cartItem.itemid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cartItem),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if(data.success) updateCartItemLocal(cartItem, quantity);
      return data.success;
    } else {
      updateCartItemLocal(cartItem, quantity);
      return true;
    }
};

  const deleteCartItem = async (item, div) => {
    const cartItem = asCartItem(item);
    if(user.isLoggedIn) {
      disableDiv(div);
      const res = await fetch(`${apiHost}/api/cart/${user.id}/${cartItem.itemid}`, {
        method: "DELETE",
        credentials: "include",
      });
      disableDiv(div, false);
      if(!res.ok) return false;
      const data = await res.json();
      if(data.success) removeFromCartLocal(cartItem);
      return data.success;
    } else {
      removeFromCartLocal(cartItem);
      return true;
    }
  };

  const getCartByUser = async () => {
    const res = await fetch(`${apiHost}/api/cart/user/${user.id}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return JSON.parse(data.message);
  };


  const signup = async (userInfo, callback) => {
    try {
      const res = await fetch(`${apiHost}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ההרשמה נכשלה");

      if (data.success) {
        const userData = mergeUserData(data.message);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser({ ...userData, isLoggedIn: true });
        toast.success(`ההרשמה הצליחה! ברוך הבא ${userData.firstname}!`, {
          onClose: () => {
            if(callback) callback();
          },
          autoClose: 2000,
        });
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const asCartItem = (item, quantity = 1) => {
    const index = cartData.findIndex(c => c.id === item.id);
    const exists = index !== -1;
    if (exists) {
      cartData[index].quantity = quantity;
      cartData[index].userid = user.id||-1;
      return cartData[index];
    } else {
      return { id: item.id, itemid: item.id, userid: user.id||-1, quantity: quantity };
    }
  };
  
  const toggleCart = async (item, div, quantity = 1) => {
    const existInCart = user?.cartItems?.includes(item.id) || false;
     if(existInCart) {
        await deleteCartItem(item, div);
     }
     else
    {
       await addToCart(item,div, quantity);
    }
  };

  const addToCartLocal = (cartItem) => {
    updateUser("cartItems", cartItem.itemid, "add");
    updateCartData(cartItem,"add");
    window.dispatchEvent(new Event("cartChanged"));
  };

  const removeFromCartLocal = (cartItem) => {
    updateUser("cartItems", cartItem.itemid, "remove");
    updateCartData(cartItem,"remove");
    window.dispatchEvent(new Event("cartChanged"));
  };

  const updateCartItemLocal = (cartItem, quantity) => {
    if (cartItem) {
      const updatedItem = { ...cartItem, quantity: quantity };
      updateCartData(updatedItem, "replace");
    }
    window.dispatchEvent(new Event("cartChanged"));
  };

  return (
    <UserContext.Provider
      value={{
        apiHost,
        user,
        cartData,
        updateUser,
        clearUserFromStorage,
        login,
        logout,
        signup,
        updateCartData,
        addToCart, updateCartItem, deleteCartItem, getCartByUser, isDivDisabled, toggleCart
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
