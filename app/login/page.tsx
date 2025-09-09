/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Anchor,
  Stack,
  Group,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { auth } from "@/server/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { IconAt, IconEyeCheck, IconEyeOff } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const VisibilityToggleIcon = ({ reveal }: { reveal: boolean }) =>
  reveal ? (
    <IconEyeOff
      style={{ width: "var(--psi-icon-size)", height: "var(--psi-icon-size)" }}
    />
  ) : (
    <IconEyeCheck
      style={{ width: "var(--psi-icon-size)", height: "var(--psi-icon-size)" }}
    />
  );

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      
        <Container size={400} my={100}>
          <Title order={1} ta="center" mb="xl">
            Log In
          </Title>

          <Paper withBorder shadow="sm" p={30} radius="md">
            <Stack gap="md">
              {error && <Text c="red">{error}</Text>}
              <TextInput
                label="Email"
                name="email"
                placeholder="Enter your email"
                leftSection={<IconAt size={16} />}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                name="password"
                placeholder="Enter your password"
                visibilityToggleIcon={VisibilityToggleIcon}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />

              <Button onClick={handleLogin} fullWidth mt="md" loading={isLoading}>
                Sign In
              </Button>

              <Group justify="center" mt="md">
                <Text>Don&apos;t have an account?</Text>
                <Anchor href="/signup" size="sm">
                  Create one
                </Anchor>
              </Group>
            </Stack>
          </Paper>
        </Container>
    </div>
  );
};

export default LoginPage;
