import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const { t } = useTranslation();
  const { login, authenticated, ready } = usePrivy();
  const navigate = useNavigate();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (ready && authenticated) {
      navigate('/app', { replace: true });
    }
  }, [authenticated, ready, navigate]);

  return (
    <div className="min-h-screen bg-primary flex flex-col px-8 pt-safe pb-safe">
      {/* Title */}
      <h1 className="text-white text-center py-10 font-bold text-3xl md:text-4xl tracking-tight leading-tight">
        {t('screens.auth.title')}
      </h1>

      {/* Image Section */}
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        <img 
          src="/assets/images/on-boarding.png" 
          alt="On boarding" 
          className="w-[284px] h-[251px] object-contain mb-6"
        />
        <p className="text-white text-center max-w-[250px] font-medium text-sm leading-6">
          {t('screens.auth.subTitle')}
        </p>
      </div>

      {/* Button */}
      <div className="w-full mt-auto pb-16">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={login}
          className="w-full bg-accent text-white rounded-[20px] h-[58px] font-bold text-base transition-colors"
        >
          {t('screens.auth.start')}
        </motion.button>
      </div>
    </div>
  );
};

