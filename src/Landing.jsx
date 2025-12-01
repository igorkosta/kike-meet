import React from "react";
import { Video, Smartphone, Users, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactTyped } from "react-typed";
import { useTranslation } from "react-i18next";

import FAB from "./components/FAB";
import useIsMobile from "./hooks/useIsMobile";

export default function LandingPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#202124]">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <img src="/icon-192.png" alt="Buzz" className="w-10 h-10 mr-2 object-contain" />
          <h3>Buzz (ἄλφα)</h3>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row flex-1 items-center justify-center px-8 py-20 gap-14">
        {/* Left Text Block */}
        <div className="max-w-xl">
          <h1 className="text-4xl lg:text-6xl font-semibold mb-6 backdrop-blur-md">
            {t('landing.title')} {" "}<br/>
            <ReactTyped
              className="text-blue-700 backdrop-blur-md bg-white/30"
              strings={[
                t('landing.typed.text1'),
                t('landing.typed.text2'),
                t('landing.typed.text3'),
                t('landing.typed.text4'),
                t('landing.typed.text5'),
                t('landing.typed.text6')
              ]}
              typeSpeed={200} loop
              backSpeed={20}
              cursorChar="|"
              showCursor={true}
            />
          </h1>
          {!isMobile && (
            <div>
              <p className="text-lg text-gray-600 mb-8">
                {t('landing.description')}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/meet")}
                  className="text-m flex items-center gap-2 bg-blue-700 text-white px-4 py-4 rounded-full hover:bg-blue-600"
                >
                  <Video size={22} /> {t('landing.createMeeting')}
                </button>
              </div>
            </div>
          )}
        </div>
        <FAB />
        {/* Right Illustration */}
        {isMobile ? (
          <div className="flex-1 w-full">
            <div className="w-full h-full md:h-[500px] rounded-2xl overflow-hidden shadow">
              <img
                src="/buzz-mobile.png"
                alt="Meeting Example"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-lg w-full p-0 rounded-2xl shadow-md">
            <div className="h-100 rounded-2xl overflow-hidden">
              <img
                src="/buzz-desktop.png"
                alt="Meeting preview"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <section className="px-8 py-20 bg-white border-t border-gray-200">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('slogan')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-medium text-xl mb-2">{t('landing.features.p2p.title')}</h3>
            <p className="text-gray-600">{t('landing.features.p2p.description')}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-medium text-xl mb-2">{t('landing.features.security.title')}</h3>
            <p className="text-gray-600">{t('landing.features.security.description')}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Smartphone className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="font-medium text-xl mb-2">{t('landing.features.device.title')}</h3>
            <p className="text-gray-600">{t('landing.features.device.description')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Buzz — {t('slogan')}.
      </footer>
    </div>
  );
}
