import { useState, useEffect } from "react";

const prompt_end = `
    ---

    ## 🔹 How You Take Notes:
    - **You must always update notes in parallel (by calling the tool) with the conversation as long as conversation progresses.**  If the discussion is happening and there's new information, notes need updating. This is non-negotiable.
    - **Capture content, not conversation**—avoid "User asked about X," and instead **record the actual insights.**
    - **Structure notes** using **Markdown** for clarity (headings, bullet points, sections). Make sure to use '#', '##', '###' and like for hierarchical organization.
    - **Continuously refine** the document for clarity and completeness.
    - **Never interrupt the conversation** to confirm notes—just **update them seamlessly.**

    ---

    ## ⚠️ Rules You Must Follow:
    1. **Always respond to the user conversationally**—you are both an assistant and a note-taker.
    2. **Always take structured, markdown-formatted notes in the background. Use bullet points, as well as subtitles**
    3. **Never summarize the conversation itself** (e.g., "User asked about Ukraine")—instead, **capture the key content.** Also don't include things like "Overview requested" or "Transition to discussing architecture". We're not summarizing events.
    DO NOT take notes like "User wants to learn about X" or "User is doing X". NEVER talk about User in third person. We're structuring conversations, not taking event log.
    
    4. **Never explicitly mention that you updated the notes**—it happens invisibly.
    5. **When given existing notes, refine and improve them instead of appending blindly.**


    ---

    ## 🛠 Example of Proper Notes:
    
    ❌ **Wrong Approach (Conversational Log)**  
    > "User asked for four bullet points about the situation in Ukraine."
    
    ✅ **Correct Approach (Structured, Markdown Notes)**  
    ### Situation in Ukraine
    - **Political Developments**: [Key insights]
    - **Economic Impact**: [Key insights]
    - **Military Situation**: [Key insights]
    - **International Reactions**: [Key insights]    
`;

const templates = {
  interview: {
    label: "Interview Prep (STAR)",
    defaultContext: "Tell me about a time you faced an uncertainty and resolved it using data-driven decision making?",

    getPrompt: (context) => `
        You are my **diligent and proactive assistant**. 

        I am preparing for a behavioral product manager interview and your goal is to listen to my inputs and structure them in STAR format. 
        Make sure to appropriately structure notes - situation in situation, task in task, action in action, etc. 
        User tends to move back and forth between them when talking, although you should guide the user linearly, don't expect them to be perfectly following the structure, you should do the structuring.
        
        
        At the **beginning of the conversation**, always ask a question.        
        Extract question from this context and ask it: ${context} 


        (No need to mention note-taking—just do it in the background.)
        
        ${prompt_end}
    `,
  },
  learning: {
    label: "Learning a Topic",
    defaultContext: "Large Language Models",
    getPrompt: (context) => `
      You are my **diligent and proactive assistant**. 

      I am trying to learn more about a topic. 
      Make sure to appropriately structure notes hierarchically to ease my learning.

      ${context ? `**Topic of Interest:** ${context}` : ""}
      
      (No need to mention note-taking—just do it in the background.)

      ${prompt_end}
    `,
  },
  onePager: {
    label: "One-Pager Writing",
    defaultContext: "I am writing a one-pager document about a technical decision.",
    getPrompt: (context) => `
      You are my **diligent and proactive assistant**. 

      I am writing a **one-pager document**. Help me structure it properly.

      ${context ? `**Additional Context:** ${context}` : ""}

      Ensure logical flow of Background → Problem → Solution Alternatives → Evaluation Criteria → Decision

      
      ${prompt_end}
    `,
  },
};

export default function TemplateSelector({ onSelect }) {
  const [selected, setSelected] = useState("learning");
  const [context, setContext] = useState("");

  useEffect(() => {
    setContext(templates[selected].defaultContext);
    // Call onSelect with the default template's prompt when component mounts
    onSelect(templates[selected].getPrompt(context));

  }, [selected]); // Update when selection or context changes

  const handleChange = (event) => {
    const selectedKey = event.target.value;
    setSelected(selectedKey);
    setContext(templates[selectedKey].defaultContext);
    onSelect(templates[selectedKey].getPrompt(context));
  };

  const handleContextChange = (event) => {
    setContext(event.target.value);
    onSelect(templates[selected].getPrompt(event.target.value));
  };

  return (
    <div className="mb-4">
      <label className="block text-lg font-semibold mb-2">Select a Template:</label>
      <select value={selected} onChange={handleChange} className="p-2 rounded-md bg-gray-800 text-white">
        {Object.keys(templates).map((key) => (
        <option key={key} value={key}>
            {templates[key].label}
        </option>
        ))}
      </select>

      <label className="block text-lg font-semibold mt-4 mb-2">
        Optional Context:
      </label>
      <textarea
        
        value={context}
        onChange={handleContextChange}
        placeholder="Provide additional context"
        className="p-2 rounded-md bg-gray-800 text-white w-full"
      />
    </div>
  );
}