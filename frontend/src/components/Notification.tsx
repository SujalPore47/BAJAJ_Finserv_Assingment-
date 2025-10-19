"use client";

const Notification = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    return (
      <div className={`fixed top-24 right-5 text-white p-4 rounded-lg shadow-lg animate-fade-in-down ${bgColor}`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold">X</button>
      </div>
    );
  };

export default Notification;
