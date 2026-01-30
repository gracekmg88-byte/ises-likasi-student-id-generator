import { PaymentSettings } from "@/types/student";

const PAYMENT_SETTINGS_KEY = "kmg_payment_settings";

const DEFAULT_SETTINGS: PaymentSettings = {
  mobileMoneyNumber: "+243 998 102 000",
  mobileMoneyBeneficiary: "KOT GARCIA",
  bankName: "Equity BCDC",
  bankAccountUSD: "566100175483041",
  bankAccountCDF: "566100175482556",
  bankBeneficiary: "KOT MUNON GRÂCE",
  whatsappNumber: "243998102000",
};

export const getPaymentSettings = (): PaymentSettings => {
  const data = localStorage.getItem(PAYMENT_SETTINGS_KEY);
  if (data) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

export const updatePaymentSettings = (settings: Partial<PaymentSettings>): PaymentSettings => {
  const current = getPaymentSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const resetPaymentSettings = (): PaymentSettings => {
  localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
};
