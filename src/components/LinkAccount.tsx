import { usePrivy } from "@privy-io/react-auth";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const LinkAccount = () => {
  const { linkEmail, linkPhone, user } = usePrivy();
  const { t } = useTranslation();

  const emailAccount = user?.linkedAccounts?.find(
    (account) => account.type === "email"
  );
  const phoneAccount = user?.linkedAccounts?.find(
    (account) => account.type === "phone"
  );

  const hasEmail = !!emailAccount;
  const hasPhone = !!phoneAccount;

  return (
    // <div className="space-y-3 mb-4">
    // 	Email
    // 	<div className="flex items-center justify-between bg-white border-b border-[#12033A1A] p-4">
    // 		<div className="flex items-center gap-4">
    // 			<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    // 				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    // 			</svg>
    // 			<div className="flex-1">
    // 				<p className="text-[#12033A] font-bold text-base">
    // 					{t('profile.linkAccount.email')}
    // 				</p>
    // 				{hasEmail && emailAccount.type === 'email' && (
    // 					<p className="text-[#12033A66] text-sm font-medium">{emailAccount.address}</p>
    // 				)}
    // 			</div>
    // 		</div>
    // 		{!hasEmail ? (
    // 			<motion.button
    // 				whileTap={{ scale: 0.95 }}
    // 				onClick={linkEmail}
    // 				className="px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm"
    // 			>
    // 				{t('profile.linkAccount.link')}
    // 			</motion.button>
    // 		) : (
    // 			<div className="flex items-center gap-2">
    // 				<div className="w-2 h-2 rounded-full bg-green-500" />
    // 				<span className="text-green-600 text-sm font-semibold">
    // 					{t('profile.linkAccount.linked')}
    // 				</span>
    // 			</div>
    // 		)}
    // 	</div>

    // 	{/* Phone */}
    // 	<div className="flex items-center justify-between bg-white border-b border-[#12033A1A] p-4">
    // 		<div className="flex items-center gap-4">
    // 			<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    // 				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    // 			</svg>
    // 			<div className="flex-1">
    // 				<p className="text-[#12033A] font-bold text-base">
    // 					{t('profile.linkAccount.phone')}
    // 				</p>
    // 				{hasPhone && phoneAccount.type === 'phone' && (
    // 					<p className="text-[#12033A66] text-sm font-medium">{phoneAccount.phoneNumber}</p>
    // 				)}
    // 			</div>
    // 		</div>
    // 		{!hasPhone ? (
    // 			<motion.button
    // 				whileTap={{ scale: 0.95 }}
    // 				onClick={linkPhone}
    // 				className="px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm"
    // 			>
    // 				{t('profile.linkAccount.link')}
    // 			</motion.button>
    // 		) : (
    // 			<div className="flex items-center gap-2">
    // 				<div className="w-2 h-2 rounded-full bg-green-500" />
    // 				<span className="text-green-600 text-sm font-semibold">
    // 					{t('profile.linkAccount.linked')}
    // 				</span>
    // 			</div>
    // 		)}
    // 	</div>
    // </div>
    <></>
  );
};

export default LinkAccount;
