import { MiniKit } from "@worldcoin/minikit-js";
import { ReactNode, useEffect } from "react";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
    MiniKit.install();
    } catch(e) {
      console.log('error: ', e)
    }
  }, []);

  console.log("Is MiniKit installed correctly? ", MiniKit.isInstalled());

  return <>{children}</>;
}
