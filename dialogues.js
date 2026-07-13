/* ============================================================
   Dados dos suspeitos e diálogos
   - 3 suspeitos falam Simple Present CORRETO.
   - O culpado (#4) comete erros clássicos de Simple Present:
       * verbo sem -s na 3ª pessoa: "He work" / "She cook"
       * "don't" no lugar de "doesn't": "He don't see" / "She don't know"
   ============================================================ */

const SUSPECTS = {
  1: {
    name: "Joseph Miller",
    role: "Mechanic",
    dialogues: {
      // ✔ gramática correta
      victim:
        "I don't know the victim. He comes to my garage once. He pays and he leaves. That's all.",
      suspicion:
        "I fix cars every day. I work with my hands, not with weapons. My boss trusts me."
    }
  },
  2: {
    name: "Edna Harris",
    role: "Retired Teacher",
    dialogues: {
      // ✔ gramática correta (ela é professora de inglês!)
      victim:
        "He goes to the bakery every morning. He always smiles at me. He says good morning to everyone.",
      suspicion:
        "I am 78 years old. I bake pies and I read books. I don't hurt anyone, dear detective."
    }
  },
  3: {
    name: "Arthur Kane",
    role: "Bank Manager",
    dialogues: {
      // ✔ gramática correta
      victim:
        "He has an account at my bank. He pays his bills on time. He never causes any trouble.",
      suspicion:
        "I run a bank. I sign papers and I meet clients. I solve problems with numbers, not with violence."
    }
  },
  4: {
    // ==========================================================
    // CULPADO — Suspeito 4
    // Comete erros de Simple Present na 3ª pessoa do singular.
    // ==========================================================
    name: "João Pedro Araújo",
    role: "Student",
    dialogues: {
      // ✘ "He work" (falta o -s), "He take" (falta -s), "He don't" (deveria ser doesn't)
      victim:
        "Oxente, i don't really know him. He work late every night. He take the same street at 11 p.m. He don't see anyone around.",
      // ✘ "My mom cook" (falta -s), "She don't know" (deveria ser doesn't)
      suspicion:
        "Oxente, i am just a student. My mom cook dinner every night. She don't know I go out late. That's all."
    }
  }
};

// Perguntas fixas para todos os suspeitos.
const QUESTIONS = [
  { id: "victim",     label: "Do you know the victim?" },
  { id: "suspicion",  label: "Why should I trust you?" }
];
