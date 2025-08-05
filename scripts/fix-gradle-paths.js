const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Fixing Gradle paths for pnpm compatibility...');

// Paths to fix
const settingsGradlePath = path.join(__dirname, '../android/settings.gradle');
const buildGradlePath = path.join(__dirname, '../android/build.gradle');

// Search in multiple locations for the Expo config script
function findExpoConfigScript() {
  try {
    // First attempt - directly check standard locations in node_modules
    const baseDir = path.join(__dirname, '..');
    const possibleLocations = [
      // Direct expo path
      path.join(baseDir, 'node_modules/expo/scripts/get-react-native-config.gradle'),
      // pnpm structure - main path
      glob(path.join(baseDir, 'node_modules/.pnpm/expo@*/node_modules/expo/scripts/get-react-native-config.gradle')),
      // Check in expo-cli directory
      path.join(baseDir, 'node_modules/@expo/cli/scripts/get-react-native-config.gradle'),
      // Check in a parent node_modules
      path.join(baseDir, '../node_modules/expo/scripts/get-react-native-config.gradle'),
    ];

    for (const location of possibleLocations) {
      if (typeof location === 'string' && fs.existsSync(location)) {
        console.log(`Found Expo config script at: ${location}`);
        return location;
      }
    }

    // Use Node to find the Expo package and check its structure
    const expoDir = path.dirname(require.resolve('expo/package.json', { paths: [baseDir] }));
    console.log(`Found Expo package at: ${expoDir}`);
    
    const configPath = path.join(expoDir, 'scripts', 'get-react-native-config.gradle');
    if (fs.existsSync(configPath)) {
      console.log(`Found Expo config script at: ${configPath}`);
      return configPath;
    }
    
    // Try to create the script
    console.log('Expo config script not found, creating a minimal version...');
    const minimalScript = createMinimalExpoConfigScript();
    const customScriptPath = path.join(baseDir, 'android', 'expo-config.gradle');
    fs.writeFileSync(customScriptPath, minimalScript);
    console.log(`Created minimal Expo config script at: ${customScriptPath}`);
    return customScriptPath;
  } catch (error) {
    console.error('Error finding Expo config script:', error.message);
    return null;
  }
}

// Helper function to glob files in a directory (simplified version)
function glob(pattern) {
  try {
    const matches = execSync(`find ${path.dirname(pattern)} -path "${pattern}" -type f | head -n 1`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    if (matches) {
      return matches;
    }
  } catch (error) {
    // Ignore errors, will return undefined
  }
  return undefined;
}

// Create a minimal version of the Expo config script if it can't be found
function createMinimalExpoConfigScript() {
  return `// Minimal Expo config script created by fix-gradle-paths.js
// This is a fallback solution when the original script can't be found

def nodeExecutableAndArgs = [findNodeCommand(), "-e", "console.log(JSON.stringify(require('react-native/package.json').version))"]

def getReactNativeVersionFromNodeModule() {
    def nodeCommand = nodeExecutableAndArgs
    def process = nodeCommand.execute(null, rootDir)
    def outputStream = new ByteArrayOutputStream()
    def errorStream = new ByteArrayOutputStream()
    process.waitForProcessOutput(outputStream, errorStream)
    if (process.exitValue() != 0) {
        throw new GradleException("Failed to get React Native version, node command exited with: \${process.exitValue()}:\\n\${errorStream.toString()}")
    }
    return new groovy.json.JsonSlurper().parseText(outputStream.toString().trim())
}

String findNodeCommand() {
    def nodeCommand = System.getProperty("nodejs.command")
    if (nodeCommand != null) {
        return nodeCommand
    }
    if (System.getProperty("os.name").toLowerCase().contains("windows")) {
        nodeCommand = "node.exe"
    } else {
        nodeCommand = "node"
    }
    return nodeCommand
}

ext {
    reactNativeVersion = getReactNativeVersionFromNodeModule()
    reactNativeVersionMajor = reactNativeVersion.split("\\\\.")[0].toInteger()
    reactNativeVersionMinor = reactNativeVersion.split("\\\\.")[1].toInteger()
}

// Tell Gradle where to find the React Native dependency
allprojects {
    configurations.all {
        resolutionStrategy {
            dependencySubstitution {
                // Make sure we use the local version of React Native
                substitute module('com.facebook.react:react-native') using project(':ReactAndroid')
            }
        }
    }
}
`;
}

// Check if setupSdk directory exists
function checkSetupSdkExists() {
  try {
    const rnPackagePath = execSync('node -e "console.log(require.resolve(\'react-native/package.json\'))"', { encoding: 'utf8' }).trim();
    const rnDir = path.dirname(rnPackagePath);
    const setupSdkPath = path.join(rnDir, 'android', 'tools', 'setupSdk');
    
    const exists = fs.existsSync(setupSdkPath);
    console.log(`setupSdk directory ${exists ? 'exists' : 'does not exist'} at: ${setupSdkPath}`);
    return exists;
  } catch (error) {
    console.error('Error checking setupSdk:', error.message);
    return false;
  }
}

// Fix build.gradle
// Fix build.gradle
if (fs.existsSync(buildGradlePath)) {
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
    // Procurar a linha que aplica o script do Expo e substituir pelo caminho correto
    const expoConfigScriptPath = findExpoConfigScript();
    if (!expoConfigScriptPath) {
      console.error('Não foi possível encontrar ou criar o script de configuração do Expo.');
      process.exit(1);
    }
  
    // Ajustar o caminho para ser relativo ao arquivo build.gradle
    const relativePath = path.relative(path.dirname(buildGradlePath), expoConfigScriptPath).replace(/\\/g, '/');
  
    // Regex para substituir qualquer aplicação anterior do script get-react-native-config.gradle
    const regexApply = /apply from: ['"].*get-react-native-config\.gradle['"]/;
    if (regexApply.test(buildGradleContent)) {
      buildGradleContent = buildGradleContent.replace(regexApply, `apply from: '${relativePath}'`);
      console.log(`Atualizado o caminho do script Expo em build.gradle para '${relativePath}'`);
    } else {
      // Caso não exista, adiciona a aplicação no final do arquivo
      buildGradleContent += `\napply from: '${relativePath}'\n`;
      console.log(`Adicionado o script Expo em build.gradle no caminho '${relativePath}'`);
    }
  
    fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');
  } else {
    console.warn(`Arquivo build.gradle não encontrado em: ${buildGradlePath}`);
  }
  
  // Fix settings.gradle
  if (fs.existsSync(settingsGradlePath)) {
    let settingsGradleContent = fs.readFileSync(settingsGradlePath, 'utf8');
  
    // Exemplo: garantir que o projeto ReactAndroid esteja incluído para resolver dependências locais
    const includeReactAndroid = "include ':ReactAndroid'";
    if (!settingsGradleContent.includes(includeReactAndroid)) {
      settingsGradleContent += `\n${includeReactAndroid}\n`;
      fs.writeFileSync(settingsGradlePath, settingsGradleContent, 'utf8');
      console.log("Adicionado ':ReactAndroid' em settings.gradle");
    } else {
      console.log("':ReactAndroid' já está presente em settings.gradle");
    }
  } else {
    console.warn(`Arquivo settings.gradle não encontrado em: ${settingsGradlePath}`);
  }
  
  console.log('Correção de caminhos Gradle finalizada.');
  
