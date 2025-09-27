import * as fs from 'fs';
import * as path from 'path';

/**
 * Convertit une chaîne en kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace plusieurs tirets consécutifs par un seul
    .replace(/^-+|-+$/g, ''); // Supprime les tirets en début et fin
}

/**
 * Supprime la chaîne spécifiée du nom de fichier
 */
function removePrefix(filename: string, prefix: string): string {
  return filename.replace(prefix, '').trim();
}

/**
 * Renomme tous les fichiers d'un dossier
 */
async function renameFilesInDirectory(directoryPath: string): Promise<void> {
  const stringToRemove = 'Casa de Cha - ';

  try {
    // Vérifier si le dossier existe
    if (!fs.existsSync(directoryPath)) {
      console.error(`❌ Le dossier "${directoryPath}" n'existe pas.`);
      return;
    }

    // Lire le contenu du dossier
    const files = fs.readdirSync(directoryPath);

    if (files.length === 0) {
      console.log('📁 Le dossier est vide.');
      return;
    }

    console.log(
      `📂 Traitement de ${files.length} fichier(s) dans "${directoryPath}"...\n`
    );

    let renamedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const oldFilePath = path.join(directoryPath, file);

      // Ignorer les dossiers
      if (fs.statSync(oldFilePath).isDirectory()) {
        console.log(`📁 Ignoré (dossier): ${file}`);
        skippedCount++;
        continue;
      }

      // Séparer le nom et l'extension
      const extension = path.extname(file);
      const nameWithoutExtension = path.basename(file, extension);

      // Supprimer la chaîne spécifiée
      const nameWithoutPrefix = removePrefix(
        nameWithoutExtension,
        stringToRemove
      );

      // Convertir en kebab-case
      const kebabName = toKebabCase(nameWithoutPrefix);

      // Si le nom est vide après traitement, utiliser un nom par défaut
      const finalName = kebabName || 'fichier-sans-nom';

      const newFileName = finalName + extension;
      const newFilePath = path.join(directoryPath, newFileName);

      // Vérifier si le nom a changé
      if (file === newFileName) {
        console.log(`⏭️  Aucun changement: ${file}`);
        skippedCount++;
        continue;
      }

      // Vérifier si le nouveau nom existe déjà
      if (fs.existsSync(newFilePath)) {
        console.log(
          `⚠️  Conflit: "${newFileName}" existe déjà, fichier "${file}" ignoré`
        );
        skippedCount++;
        continue;
      }

      try {
        // Renommer le fichier
        fs.renameSync(oldFilePath, newFilePath);
        console.log(`✅ Renommé: "${file}" → "${newFileName}"`);
        renamedCount++;
      } catch (error) {
        console.error(`❌ Erreur lors du renommage de "${file}":`, error);
        skippedCount++;
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   • Fichiers renommés: ${renamedCount}`);
    console.log(`   • Fichiers ignorés: ${skippedCount}`);
    console.log(`   • Total traités: ${files.length}`);
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du dossier:', error);
  }
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📖 Usage: npx ts-node rename.ts <chemin-du-dossier>');
    console.log('📖 Exemple: npx ts-node rename.ts ./mon-dossier');
    return;
  }

  const directoryPath = args[0];
  const absolutePath = path.resolve(directoryPath);

  console.log(`🚀 Démarrage du script de renommage...`);
  console.log(`📂 Dossier cible: ${absolutePath}`);
  console.log(`🗑️  Suppression de la chaîne: "Casa de Cha - AUDIO "`);
  console.log(`🔄 Conversion en kebab-case\n`);

  await renameFilesInDirectory(absolutePath);
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}
