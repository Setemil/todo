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
import {
  IconAt,
  IconEyeCheck,
  IconEyeOff,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/server/firebase";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";

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

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (password === confirmPassword) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: name });
        router.push("/home");
      } else {
        setError("Your Passwords Do Not Match");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSignup}>
        <Container size={400} my={100}>
          <Title order={1} ta="center" mb="xl">
            Create Account
          </Title>

          <Paper withBorder shadow="sm" p={30} radius="md">
            <Stack gap="md">
              {error && (
                <Text c="red" size="sm" mt="sm">
                  {error}
                </Text>
              )}
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={16} />}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<IconAt size={16} />}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                visibilityToggleIcon={VisibilityToggleIcon}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                visibilityToggleIcon={VisibilityToggleIcon}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                required
              />

              <Button type="submit" fullWidth mt="md" loading={loading}>
                Create Account
              </Button>

              <Group justify="center" mt="md">
                <Text>Already have an account?</Text>
                <Anchor href="/login" size="sm">
                  Sign in
                </Anchor>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </form>
    </div>
  );
};

export default SignupPage;
