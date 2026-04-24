export const LATEST_UPDATE_ID = "2024-04-24";
export const UPDATE_VERSION = "v1.2.1";
export const UPDATE_TITLE = "Ada yang baru!";

export interface UpdateFeature {
  title: string;
  description: string;
}

export const UPDATE_FEATURES: UpdateFeature[] = [
  {
    title: "Sembunyikan Saldo",
    description: "Ketuk ikon mata di samping saldo untuk menjaga privasi nominal uang Anda.",
  },
  {
    title: "Dialog Update!",
    description: "Sekarang pengguna bisa tau ada yang baru di setiap update.",
  },
];

// List simpel untuk perbaikan kecil
export const MINOR_FIXES: string[] = [
  //"update kecil",
];
