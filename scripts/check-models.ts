import { GoogleGenerativeAI } from "@google/generative-ai";

// Leer API KEY de .env.local manualmente para evitar dependencias
import fs from 'fs';
import path from 'path';

function getApiKey() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

async function listModels() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY no encontrada en .env.local");
        return;
    }

    console.log("Validando modelos para API Key:", apiKey.substring(0, 8) + "...");

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();

        console.log("\n--- Modelos Disponibles ---");
        if (data.models) {
            data.models.forEach((m: any) => {
                const modelShortName = m.name.replace('models/', '');
                console.log(`- ${modelShortName} [${m.displayName}]`);
                // console.log(`  Métodos: ${m.supportedGenerationMethods.join(", ")}`);
            });
            console.log("---------------------------\n");
        } else {
            console.log("No se pudieron listar los modelos:", data);
        }
    } catch (error) {
        console.error("Error al validar modelos:", error);
    }
}

listModels();
