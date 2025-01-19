import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMail, FiX } from "react-icons/fi";

export const Contact = () => {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>("");
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [isMessageValid, setIsMessageValid] = useState(false);
  const [isButtonColored, setIsButtonColored] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsButtonColored(scrollPercent > 30);
      if (scrollPercent > 95 && !open) {
        setOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  useEffect(() => {
    const wordCount = countWords(formState.message.value);
    setIsMessageValid(wordCount >= 3);
  }, [formState.message.value]);

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

  const handleSubmit = async () => {
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

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      console.log('Sending request to:', `${baseUrl}/api/send-email`);
      console.log('Request data:', { email: email.value, message: message.value });
      
      const response = await fetch(`${baseUrl}/api/send-email`, {
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
      console.log('Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send message');
      }

      // Clear form on success
      setFormState({
        email: { value: '', error: '' },
        message: { value: '', error: '' },
      });
      
      setSuccess('Message sent successfully! I\'ll get back to you soon. 🚀');
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
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
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isButtonColored ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-300'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiMail className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:bottom-auto md:right-4 md:top-4 md:left-auto md:w-[400px] bg-zinc-900 rounded-lg shadow-xl z-50"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                    <FiMail className="w-5 h-5" />
                    Contact Me
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={formState.email.value}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          email: { value: e.target.value, error: "" },
                        })
                      }
                      className="w-full px-4 py-2 bg-zinc-800 rounded-md border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                    {formState.email.error && (
                      <p className="mt-1 text-red-500 text-sm">{formState.email.error}</p>
                    )}
                  </div>

                  <div>
                    <textarea
                      placeholder="Your message"
                      value={formState.message.value}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          message: { value: e.target.value, error: "" },
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 bg-zinc-800 rounded-md border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                    {formState.message.error && (
                      <p className="mt-1 text-red-500 text-sm">{formState.message.error}</p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!isMessageValid}
                    className={`w-full px-4 py-2 md:py-4 border-2 rounded-md font-normal text-sm mb-4 transition duration-200 hover:shadow-none flex items-center justify-center gap-2 ${
                      isMessageValid 
                        ? 'text-zinc-100 border-cyan-500 bg-cyan-500 hover:bg-cyan-600 hover:border-cyan-600'
                        : 'text-zinc-400 border-zinc-800 bg-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    <FiMail className="w-4 h-4" />
                    {loading ? "Submitting..." : "Submit"}
                  </button>

                  {success && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-500 text-sm"
                    >
                      {success}
                    </motion.p>
                  )}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
