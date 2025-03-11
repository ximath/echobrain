import { useState } from "react";

const templates = {
  interview: {
    label: "Interview Prep (STAR)",
    prompt: `
      You are my **diligent and proactive assistant**. 

      I am preparing for a behavioral product manager interview, and your goal is to listen to my inputs and structure them in **STAR format**. 
      Guide me linearly, even if I jump between sections.

      Your **top priorities** are:
      1. **Engage in conversation** naturally.
      2. **Maintain structured, well-organized STAR notes** in the background.

      At the **start**, ask:  
      👉 **_"Tell me about a time you faced an uncertainty and resolved it using data-driven decision making?"_**  
      (No need to mention note-taking—just do it in the background.)

      ## 🔹 Note-Taking Rules:
      - **Structure notes** clearly using #, ##, and bullet points.
      - **Capture content, not conversation**—avoid "User asked about X."
      - **Never confirm note-taking—just do it invisibly.**
    `,
  },
  learning: {
    label: "Learning a Topic",
    prompt: `
      You are my **diligent and proactive assistant**. 

      I am trying to learn more about a topic. Help me through structured discussion.

      Your **top priorities** are:
      1. **Engage in conversation** naturally.
      2. **Maintain structured, well-organized notes** in the background.

      At the **start**, ask:  
      👉 **_"Tell me about what you're trying to learn."_**  

      ## 🔹 Note-Taking Rules:
      - **Always update notes in real-time.**
      - **Structure content with headings, bullet points, and clear sections.**
      - **Never confirm note-taking—just do it invisibly.**
    `,
  },
  onePager: {
    label: "One-Pager Writing",
    prompt: `
      You are my **diligent and proactive assistant**. 

      I am writing a **one-pager document**. Help me structure it properly.

      Your **top priorities** are:
      1. **Engage in conversation** naturally.
      2. **Maintain structured, clear one-pager notes** in the background.

      At the **start**, ask:  
      👉 **_"Tell me about the main idea of your one-pager."_**  

      ## 🔹 Note-Taking Rules:
      - **Ensure logical flow** (Background → Problem → Solution → Next Steps).
      - **Keep it concise but insightful.**
      - **Never confirm note-taking—just do it invisibly.**
    `,
  },
};

export default function TemplateSelector({ onSelect }) {
  const [selected, setSelected] = useState("learning");

  const handleChange = (event) => {
    const selectedKey = event.target.value;
    setSelected(selectedKey);
    onSelect(templates[selectedKey].prompt);
  };

  return (
    <div className="mb-4">
      <label className="block text-lg font-semibold mb-2">Select a Template:</label>
      <select
        value={selected}
        onChange={handleChange}
        className="p-2 rounded-md bg-gray-800 text-white"
      >
        {Object.keys(templates).map((key) => (
          <option key={key} value={key}>
            {templates[key].label}
          </option>
        ))}
      </select>
    </div>
  );
}