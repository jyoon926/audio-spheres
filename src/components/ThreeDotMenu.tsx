import React, { useState, useRef, useEffect } from "react";
import { FaEllipsis } from "react-icons/fa6";

interface ThreeDotMenuProps {
  children: React.ReactNode;
}

const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen((prev) => !prev)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={handleClick} className="p-1.5 m-[-3px] rounded-full duration-300 hover:bg-lighter">
        <FaEllipsis className="text-xl" />
      </button>
      <div
        className={`absolute right-0 rounded-md text-base bg-gray backdrop-blur-xl z-10 p-2 duration-300 ${!isOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export default ThreeDotMenu;
