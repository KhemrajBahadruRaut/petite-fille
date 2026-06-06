import React from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import {
  FaPaperPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaUserFriends,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="bg-[#7B4A2E] text-white py-5 px-6 md:px-16"
      style={{ fontFamily: "arial" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mx-auto container">
        {/* Logo + Description */}
        <div>
          <h2 className="text-2xl font-bold mb-3">Petite Fille</h2>
          <p className="text-sm leading-relaxed mb-6">
            Lorem ipsum dolor, sit amet, cons adipiscing eli Lorem ipsum dolor,
            sit amet, cons adipiscing eli
          </p>
          <div className="flex space-x-4 text-xl">
            <a
              href="https://www.facebook.com/PetiteFilleRosanna"
              aria-label="Facebook"
              className="hover:text-gray-200"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.instagram.com/petitefillerosanna/"
              aria-label="Instagram"
              className="hover:text-gray-200"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@petite.fille.cafe"
              aria-label="TikTok"
              className="hover:text-gray-200"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="font-semibold mb-4 border-b inline py-1">Contacts</h3>
          <ul className="space-y-3 text-sm pt-3">
            <a target="_blank" href="https://www.google.com/maps/place/Petite+Fille+Cafe/@-37.7449881,145.0686902,17z/data=!3m1!4b1!4m6!3m5!1s0x6ad6479f02ac47a5:0x13fd7578d4bcb97f!8m2!3d-37.7449881!4d145.0712651!16s%2Fg%2F11x2m5ffnf?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D">
              <li className="flex items-center gap-2 pb-3">
                <FaPaperPlane /> 2 Station Rd, Rosanna VIC 3084, Australia
              </li>
            </a>
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> +61 3 9191 9212
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> petitefillerosanna@gmail.com
            </li>
            {/* <li className="flex items-center gap-2">
              <FaUserFriends /> Join our team
            </li> */}
            <a href="/contacts">
              <li className="flex items-center gap-2">
                <FaUserFriends /> Contact us
              </li>
            </a>
          </ul>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-semibold mb-4 border-b inline py-1">
            Navigation
          </h3>
          <ul className="space-y-3 text-sm pt-4">
            <li>
              <a href="/" className="hover:text-gray-200">
                Home
              </a>
            </li>
            <li>
              <a href="/aboutUs" className="hover:text-gray-200">
                About us
              </a>
            </li>
            <li>
              <a href="/menu" className="hover:text-gray-200">
                Menu
              </a>
            </li>
            <li>
              <a href="/merchandise" className="hover:text-gray-200">
                Merchandise
              </a>
            </li>
            <li>
              <a href="/gallery" className="hover:text-gray-200">
                Gallery
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-gray-200">
                Careers
              </a>
            </li>
            <li>
              <a href="/catering" className="hover:text-gray-200">
                Catering
              </a>
            </li>
          </ul>
        </div>

        {/* Additionals */}
        <div>
          <h3 className="font-semibold mb-4 border-b inline py-1 ">
            Additionals
          </h3>
          <ul className="space-y-3 text-sm pt-4">
            <li>
              <a href="/termsofservice" className="hover:text-gray-200">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacypolicy" className="hover:text-gray-200">
                Privacy policy
              </a>
            </li>
            <li>
              <a href="/terms&condition" className="hover:text-gray-200">
                Terms and conditions
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} Petite Fille. All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
