// Footer.tsx
import React from "react";
import styles from "./page.module.css";

const Footer: React.FC = () => {
  return (
    <footer className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-between">
        <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
            className="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5m7-7l-7 7 7 7"></path>
          </svg>
        </button>

        {/*
        <div className="md:ml-auto md:flex hidden flex-wrap items-center text-base justify-center">
          <a className="mr-5 hover:text-gray-900">フッターリンク1</a>
          <a className="mr-5 hover:text-gray-900">フッターリンク2</a>
        </div>
        */}

        <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
            className="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14m-7-7l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
