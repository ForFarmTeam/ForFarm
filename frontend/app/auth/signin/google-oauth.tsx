import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { SessionContext } from "@/context/SessionContext";

interface OAuthExchangeData {
  jwt: string;
  email: string;
}

export function GoogleSigninButton() {
  const router = useRouter();
  const session = useContext(SessionContext);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential returned from Google");
      return;
    }

    try {
      const exchangeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/oauth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: credentialResponse.credential }),
      });
      if (!exchangeRes.ok) {
        throw new Error("Exchange token request failed");
      }
      const exchangeData: OAuthExchangeData = await exchangeRes.json();
      const jwt = exchangeData.jwt;
      const email = exchangeData.email;

      session!.setToken(jwt);
      session!.setUser(email);

      router.push("/farms");
    } catch (error) {
      console.error("Error during token exchange:", error);
    }
  };

  const handleLoginError = () => {
    console.error("Google login failed");
  };

  return <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />;
}
