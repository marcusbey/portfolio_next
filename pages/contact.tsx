import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      label: "Email",
      value: "hi@romainboboe.com",
      link: "mailto:hi@romainboboe.com"
    },
    {
      icon: MapPinIcon,
      label: "Location",
      value: "Available Worldwide",
      link: null
    },
    {
      icon: ClockIcon,
      label: "Response Time",
      value: "Within 24 hours",
      link: null
    }
  ];

  const projectTypes = [
    "Web Application Development",
    "AI/ML Integration",
    "Automation Solutions",
    "API Development",
    "Full-Stack Projects",
    "Technical Consulting",
    "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        setStatus('error');
        setErrorMessage(errorData.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <Container title="Contact | Romain BOBOE - Full Stack Developer">
      <div className="max-w-6xl mx-auto px-4 mt-10 md:mt-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-bold text-4xl md:text-6xl md:leading-tight text-zinc-50 max-w-4xl mx-auto">
            Let's Build Something
            <span className="text-cyan-500"> Amazing Together</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mt-8 md:leading-relaxed">
            Have a project in mind? Looking for technical expertise? Or just want to say hello? 
            I'd love to hear from you and discuss how we can bring your ideas to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-8">
              Get in Touch
            </h2>
            
            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 flex-shrink-0">
                    <info.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-zinc-300 font-medium mb-1">{info.label}</h3>
                    {info.link ? (
                      <a 
                        href={info.link}
                        className="text-zinc-400 hover:text-cyan-400 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-zinc-400">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-zinc-50 mb-4">
                Services I Offer
              </h3>
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700/50"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-zinc-50 mb-6">
              Send a Message
            </h2>

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg flex items-center space-x-3"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">
                  Thank you! Your message has been sent successfully. I'll get back to you soon.
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg flex items-center space-x-3"
              >
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                >
                  <option value="">Select a project type...</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors resize-vertical"
                  placeholder="Tell me about your project, timeline, budget, or any questions you have..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  status === 'loading'
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>

            <p className="text-zinc-500 text-xs mt-4 text-center">
              By submitting this form, you agree to receive a response via email.
            </p>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-zinc-50 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-700/30">
              <h3 className="text-lg font-medium text-zinc-50 mb-3">
                What's your typical project timeline?
              </h3>
              <p className="text-zinc-400 text-sm">
                Project timelines vary based on scope and complexity. Simple web applications typically take 2-4 weeks, 
                while complex full-stack solutions can take 6-12 weeks. I'll provide a detailed timeline during our initial consultation.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-700/30">
              <h3 className="text-lg font-medium text-zinc-50 mb-3">
                Do you work with existing teams?
              </h3>
              <p className="text-zinc-400 text-sm">
                Absolutely! I collaborate effectively with existing development teams, designers, and stakeholders. 
                I can integrate seamlessly into your workflow and contribute to ongoing projects.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-700/30">
              <h3 className="text-lg font-medium text-zinc-50 mb-3">
                What technologies do you specialize in?
              </h3>
              <p className="text-zinc-400 text-sm">
                I specialize in modern web technologies including Next.js, React, TypeScript, Node.js, and various databases. 
                I also work with AI/ML integrations and automation tools.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-700/30">
              <h3 className="text-lg font-medium text-zinc-50 mb-3">
                Do you provide ongoing maintenance?
              </h3>
              <p className="text-zinc-400 text-sm">
                Yes, I offer ongoing maintenance and support services. This includes bug fixes, security updates, 
                performance optimization, and feature enhancements as your project evolves.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}