import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Contact = () => {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>("");
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [isMessageValid, setIsMessageValid] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [formState, setFormState] = useState({
    email: {
      value: "",
      error: "",
    },
    message: {
      value: "",
      error: "",
    },
  });

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  useEffect(() => {
    const wordCount = countWords(formState.message.value);
    setIsMessageValid(wordCount >= 3);
  }, [formState.message.value]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled more than 200px
      const scrolled = window.scrollY > 200;
      setIsScrolled(scrolled);

      // Check if user has reached bottom of page
      const bottomThreshold = 50; // pixels from bottom
      const isAtBottom = 
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - bottomThreshold;

      if (isAtBottom && !open) {
        setOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  const dropIn = {
    hidden: {
      y: "4vh",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.2,
        type: "stiff",
        damping: 25,
      },
    },
    exit: {
      y: "4vh",
      opacity: 0,
    },
  };

  const onChangeHandler = (field: any, value: any) => {
    let state = {
      [field]: {
        value,
        error: null,
      },
    };
    setFormState({ ...formState, ...state });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let { email, message } = formState;
    let updatedState = { ...formState };
    let regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (!email.value) {
      updatedState.email.error = `Oops! Email cannot be empty.`;
      setFormState({ ...updatedState });
      return;
    }

    if (!email.value.toLowerCase().match(regex)) {
      updatedState.email.error = `Please enter a valid email address`;
      setFormState({ ...updatedState });
      return;
    }
    
    if (!message.value) {
      updatedState.message.error = `Oops! Message cannot be empty.`;
      setFormState({ ...updatedState });
      return;
    }

    if (!isMessageValid) {
      updatedState.message.error = `Message must be at least 3 words.`;
      setFormState({ ...updatedState });
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api/send-email`
        : '/api/send-email';

      console.log('Sending email request to:', apiUrl);
      
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          message: message.value,
        }),
      });

      const data = await response.json();
      console.log('Response:', { 
        status: response.status, 
        ok: response.ok,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send message: ${data.error || data.message || 'Unknown error'}`
        );
      }

      if (!data.success) {
        throw new Error(
          `Server error: ${data.message || 'Failed to send message'}`
        );
      }

      // Clear form on success
      setFormState({
        email: { value: '', error: '' },
        message: { value: '', error: '' },
      });
      
      setSuccess('Message sent successfully! I\'ll get back to you soon. 🚀');
    } catch (error: any) {
      console.error('Form submission error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      setError(
        `Failed to send message: ${error.message}. Please try again or contact me directly at ${CONTACT_FORM_EMAIL}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    setOpen(!open);
    setFormState({
      email: {
        value: "",
        error: "",
      },
      message: {
        value: "",
        error: "",
      },
    });
    setLoading(false);
    setError("");
    setSuccess("");
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-50 p-4 rounded-full transition-all duration-500 ease-in-out transform ${
          isScrolled ? 'bg-cyan-500 hover:bg-cyan-600 scale-110' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          backgroundColor: isScrolled ? '#06b6d4' : '#27272a',
          transition: { duration: 0.5 }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-zinc-800/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-x-4 top-8 z-50 origin-top rounded-3xl bg-zinc-900 p-8 border border-zinc-800/50 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl"
            >
              <div className="p-4 bg-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <h2 className="text-zinc-200 font-bold text-sm md:text-xl">
                  Have a question? Drop in your message 👇
                </h2>
                <small className="hidden md:block text-xs text-zinc-400 mb-10">
                  It won't take more than 10 seconds. Shoot your shot. 😉
                </small>
              </div>
              <div className="content p-6 flex flex-col bg-zinc-900/50 rounded-2xl mt-4 backdrop-blur-sm">
                <label className="text-sm font-normal text-zinc-400 mb-2 ">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formState.email.value}
                  onChange={(e) => onChangeHandler("email", e.target.value)}
                  className="text-zinc-400 rounded-md border bg-zinc-900 border-zinc-700 py-1 px-2 focus:outline-none focus:border-gray-400 placeholder:text-sm  mb-1"
                  placeholder="johndoe@xyz.com"
                />

                <small className="h-4 min-h-4 text-red-500 font-semibold">
                  {formState.email.error && formState.email.error}
                </small>

                <label className="text-sm font-normal text-zinc-400 mb-2 ">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={formState.message.value}
                  onChange={(e) => onChangeHandler("message", e.target.value)}
                  className="text-zinc-400 rounded-md border border-zinc-700 py-1 px-2 bg-zinc-900 focus:outline-none focus:border-gray-400 placeholder:text-sm   mb-1"
                  placeholder="I'd love a compliment from you."
                />
                <small className="h-4 min-h-4 text-red-500 font-semibold mb-4">
                  {formState.message.error && formState.message.error}
                </small>
                <button
                  onClick={handleSubmit}
                  disabled={!isMessageValid}
                  className={`w-full px-4 py-2 md:py-4 border-2 rounded-md font-normal text-sm mb-4 transition duration-200 hover:shadow-none ${
                    isMessageValid 
                      ? 'text-zinc-100 border-cyan-500 bg-cyan-500 hover:bg-cyan-600 hover:border-cyan-600'
                      : 'text-zinc-400 border-zinc-800 bg-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <small className="h-4 min-h-4 mb-4">
                  {success && (
                    <p className="text-green-500 font-semibold text-sm">
                      {success}
                    </p>
                  )}
                  {error && (
                    <p className="text-red-500 font-semibold text-sm">{error}</p>
                  )}
                </small>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
