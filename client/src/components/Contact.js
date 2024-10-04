import React, { useState } from 'react';
import emailjs from 'emailjs-com';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
    };

    // Send the email using EmailJS
    emailjs.send(
      'service_8i35pl5', // Replace with your EmailJS Service ID
      'template_2rok06u', // Replace with your EmailJS Template ID
      templateParams,
      'ltTdC6iL4JTydmF8u' // Replace with your EmailJS User ID
    ).then((response) => {
      console.log('SUCCESS!', response.status, response.text);
      alert('Your message has been sent! Thank you for contacting us.');
    }).catch((err) => {
      console.error('FAILED...', err);
      alert('Failed to send message. Please try again later.');
    });

    // Clear the form after submission
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block font-semibold mb-1">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 h-32"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default Contact;