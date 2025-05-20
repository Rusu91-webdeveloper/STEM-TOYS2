import { useTranslation } from "next-i18next";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";

const MiniCart = ({ onClose }) => {
  const { t } = useTranslation("common");
  const {
    cartItems,
    removeFromCart,
    clearCart,
    handleQuantityChange,
    getTotal,
  } = useCart();
  const { data: session } = useSession();
  const cartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCheckout = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart panel */}
      <div
        ref={cartRef}
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 animate-slideInRight overflow-hidden"
        style={{ boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.2)" }}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {t("common.cart", "Shopping Cart")}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <svg
                className="w-20 h-20 text-indigo-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p className="text-lg text-indigo-900 mb-8 font-medium">
                {t("common.emptyCart", "Your cart is empty")}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 transition-all shadow-md">
                {t("common.continueShopping", "Continue Shopping")}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white rounded-lg p-4 border border-indigo-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-indigo-900 hover:text-indigo-700 transition-colors">
                            {item.name}
                          </h3>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center border rounded-md overflow-hidden shadow-sm border-indigo-100">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                                aria-label="Decrease quantity">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="w-10 text-center py-1 text-sm font-medium text-indigo-900 border-x bg-indigo-50">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                                aria-label="Increase quantity">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                              aria-label="Remove item">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-indigo-700 text-sm font-medium">
                            {t("common.unitPrice", "Unit Price")}:
                          </span>
                          <span className="text-base font-semibold text-indigo-900">
                            {Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: "EUR", // This should come from your currency context
                            }).format(item.price)}
                          </span>
                        </div>
                        <div className="flex justify-end items-center mt-1 text-right">
                          <span className="text-sm font-bold text-indigo-700">
                            {Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: "EUR", // This should come from your currency context
                            }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-indigo-700 font-medium">
                    <p>{t("common.subtotal", "Subtotal")}</p>
                    <p>
                      {Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "EUR", // This should come from your currency context
                      }).format(getTotal())}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-lg font-semibold text-indigo-900">
                      {t("common.total", "Total")}
                    </p>
                    <p className="text-lg font-bold text-indigo-700">
                      {Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "EUR", // This should come from your currency context
                      }).format(getTotal())}
                    </p>
                  </div>
                  <p className="text-sm text-indigo-600">
                    {t(
                      "common.shippingNotice",
                      "Shipping and taxes calculated at checkout."
                    )}
                  </p>

                  <div className="grid gap-3 mt-4">
                    <Link
                      href={
                        session
                          ? "/checkout"
                          : "/auth/login?callbackUrl=/checkout"
                      }
                      className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-3 text-base font-medium text-white shadow-md hover:from-indigo-700 hover:to-purple-800 transition-all"
                      onClick={handleCheckout}>
                      {session
                        ? t("common.checkout", "Checkout")
                        : t("common.signInToCheckout", "Sign in to Checkout")}
                    </Link>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          clearCart();
                          onClose();
                        }}
                        className="flex flex-1 items-center justify-center rounded-md border border-red-500 px-6 py-2.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 transition-colors">
                        {t("common.clearCart", "Clear Cart")}
                      </button>

                      <button
                        onClick={onClose}
                        className="flex flex-1 items-center justify-center rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-6 py-2.5 text-sm font-medium text-indigo-800 shadow-sm hover:from-indigo-100 hover:to-purple-100 transition-all">
                        {t("common.continueShopping", "Continue Shopping")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
