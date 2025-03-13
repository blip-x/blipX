import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc"
import { AlertTriangle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SignInFlow } from "../types";
import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

type Props = {
  setState: ( state: SignInFlow ) => void;
}
export const SignInCard = ({ setState }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { signIn } = useAuthActions();

  const handleCredentialsSignIn = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    signIn("password", { email, password , flow: "signIn" })
      .catch(() => {
        setError("Invalid Credentials, try again!")
      }).finally(() => {
        setPending(false);
      });
  }

  const handleProviderSignIn = (value: "github" | "google") => {
    setPending(true);
    signIn(value)
      .finally(() => {
        setPending(false);
      });
  }
  return ( 
    <Card className="h-full w-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>You can also choose other services to login</CardDescription>
      </CardHeader>
      {!!error && (
        <div className="flex items-center bg-destructive/15 text-destructive p-3 mb-6 gap-x-2 text-xs rounded-md">
          <AlertTriangle className="size-4"/>
          {error}
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0 ">
        <form onSubmit={handleCredentialsSignIn} className="space-y-2.5">
          <Input 
            type="email"
            disabled={pending}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password"
            disabled={pending}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <Button type="submit" disabled={pending} className="w-full" size={"lg"}>Continue</Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button 
            disabled={pending}
            onClick={() => handleProviderSignIn("google")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute top-3 left-2.5"/>
            Continue with Google
          </Button>
          <Button 
            disabled={pending}
            onClick={() => handleProviderSignIn("github")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute top-3 left-2.5"/>
            Continue with Github
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account? <span className="text-sky-700 hover:underline cursor-pointer" onClick={() => setState("signUp")}>Sign up</span>
        </p>
      </CardContent>
    </Card>
  );
}