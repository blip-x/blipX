import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

type Props = {
  setState: ( state: SignInFlow ) => void;
}
export const SignUpCard = ({ setState }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { signIn } = useAuthActions();

  const handleCredentialsSignUp = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    if(password !== confirmPassword) {
      setError("Password not matched!")
      setPending(false);
      return;
    }
    signIn("password", { name, email, password , flow: "signUp" })
      .catch(() => {
        setError("Something went wrong")
      }).finally(() => {
        setPending(false);
      });
  }

  const handleProviderSignUp = (value: "github" | "google") => {
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
        <form onSubmit={handleCredentialsSignUp} className="space-y-2.5">
          <Input 
            type="text"
            disabled={pending}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <Input 
            type="password"
            disabled={pending}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            required
          />
          <Button type="submit" disabled={pending} className="w-full" size={"lg"}>Continue</Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button 
            disabled={pending}
            onClick={() => handleProviderSignUp("google")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute top-3 left-2.5"/>
            Continue with Google
          </Button>
          <Button 
            disabled={pending}
            onClick={() => handleProviderSignUp("github")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute top-3 left-2.5"/>
            Continue with Github
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Already have an account? <span className="text-sky-700 hover:underline cursor-pointer" onClick={() => setState("signIn")}>Sign in</span>
        </p>
      </CardContent>
    </Card>
  );
}