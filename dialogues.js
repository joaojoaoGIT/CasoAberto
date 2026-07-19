/* ============================================================
   Dados dos suspeitos e diálogos
   - 3 suspeitos falam Simple Present CORRETO.
   - O culpado (#4) fala no passado, usando formas como "worked", "took" e "didn't".
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
    // Fala no passado para descrever os fatos.
    // ==========================================================
    name: "João Pedro Araújo",
    role: "Student",
    dialogues: {
      victim:
        "I don't really know him. He worked late every night. He took the same street at 11 p.m. He didn't see anyone around. He left the bakery before midnight. He never spoke to me.",
      suspicion:
        "I was just a student. My mom cooked dinner every night. She didn't know I went out late. I met him sometimes. He didn't trust me. That's all."
    }
  }
};

// Perguntas fixas para todos os suspeitos.
const QUESTIONS = [
  { id: "victim",     label: "Do you know the victim?" },
  { id: "suspicion",  label: "Why should I trust you?" }
];
