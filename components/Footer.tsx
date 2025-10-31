import { FC } from "react";

const Footer = ({}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-1 border-gray-200/20 container mx-auto flex justify-center py-4 text-center text-sm text-gray-400">
      <div>
        © {currentYear} Overturn. Design And Developed By{"  "}
        <a href="https://www.animeshacharya.com.np" className="font-bold">
          Animesh Acharya.
        </a>
      </div>
    </footer>
  );
};

export default Footer;
