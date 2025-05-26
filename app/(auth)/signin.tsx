import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link, router } from "expo-router";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppConfig } from "@/stores/AppConfigStore"
import { EyeIcon, EyeOffIcon } from "lucide-react-native";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setAppType } = useAppConfig();

  const handleLogin = async () => {
    // In a real app, you would validate and authenticate here
    console.log("Login with:", email, password);
    
    // For demo purposes, just navigate to the main app
    router.replace("/(tabs)");
  };

  // For demo purposes - switch to user mode
  const switchToUserMode = async () => {
    await setAppType("user");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>DICIONÁRIO KRIKATI</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.subtitle}>Login Administrativo</Text>
        
        <Input className="mb-4 border-[#4B2C0B]">
          <InputField
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>

        <Input className="mb-2 border-[#4B2C0B]">
          <InputField
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <InputSlot onPress={() => setShowPassword(!showPassword)}>
            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} className="text-[#4B2C0B]" />
          </InputSlot>
        </Input>

        <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Recuperar senha</Text>
        </Pressable>

        <Button
          className="bg-[#B34700] mt-6 rounded-md"
          onPress={handleLogin}
        >
          <ButtonText className="font-bold">ENTRAR</ButtonText>
        </Button>

        <Link href="/signup" asChild>
          <Pressable style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Não possui cadastro?{" "}
              <Text style={styles.linkHighlight}>Faça aqui</Text>
            </Text>
          </Pressable>
        </Link>

        <Pressable style={styles.userModeLink} onPress={switchToUserMode}>
          <Text style={styles.userModeText}>Entrar como usuário comum</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© IFMA Imperatriz</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#B34700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2C0B",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "80%",
    maxWidth: 320,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#4B2C0B",
    fontSize: 12,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#4B2C0B",
    textAlign: "center",
  },
  linkHighlight: {
    fontWeight: "bold",
    color: "#B34700",
    textDecorationLine: "underline",
  },
  userModeLink: {
    marginTop: 30,
    padding: 10,
    alignItems: "center",
  },
  userModeText: {
    color: "#4B2C0B",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: "auto",
  },
  footerText: {
    color: "#4B2C0B",
    fontSize: 12,
  },
});
