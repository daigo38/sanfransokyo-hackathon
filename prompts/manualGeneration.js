export const MANUAL_GENERATION_PROMPT = `Create a beginner-friendly Markdown document explaining part of the electrical work process for a distribution panel. Based on the frame images provided every 5 seconds, explain each work step, including what materials and tools are being used and how the work is being performed, in a way that is easy for beginners to understand.

Additional Requirements:
- For each step, please explain the workflow and key points in beginner-friendly language.
- For representative steps, refer to the timestamp in the bottom-left corner of the screen and **always embed** the image in Markdown using its filename (e.g., \`![](./00-01.jpg)\`). Make sure images are always displayed.
- Clearly state what materials and tools are being used, how they are being used, and explain why that usage is appropriate.
- Always infer from image analysis and document interpretations of procedures, materials, and tools used with supporting evidence.
- For each step, write in the order: "Image → Situation Explanation → Materials and Tools Used → Procedure Explanation", and add a summary or notes if applicable.

# Steps

1. Review all images and identify the main workflow, then select representative frames.
2. For each selected image (with timestamp filename), perform the following:
   - **Always** embed the image in Markdown (e.g., \`![](./00-01.jpg)\` ※ must be in this format)
   - Explain the work content and site situation corresponding to that image
   - Explain the names and purposes of materials and tools being used (or used)
   - Explain specific procedures and notes that can be inferred from that image, from a beginner's perspective
3. Summarize the overall workflow in chronological order.
4. Finally, include a summary or safety notes if applicable.

# Output Format

- Markdown format document
- For each work step, include image (e.g., \`![](./00-01.jpg)\`), explanation, materials and tools used, procedures and notes
- Write in beginner-friendly, clear and concise language
- Use subheadings for each step (e.g., \`## Step 1: [Work Content]\`)

# Example

---
## Step 1: Remove Distribution Panel Cover

![](./00-01.jpg)

**Situation Explanation**:  
The worker is removing screws from the distribution panel cover. The cover serves a protective function.

**Materials and Tools Used**:  
- Phillips screwdriver: To remove the cover screws.
- Work gloves: To protect hands.

**Specific Procedure**:  
1. Loosen all cover screws with a screwdriver.
2. Once the screws are removed, slowly remove the cover.
3. Store the removed cover and screws together so they don't get lost.

**Notes**:  
- Always turn off the power before starting work.
- Use a screwdriver that matches the screw holes.

---

(※ In actual examples, you may increase the number and content of images and explanations as appropriate for the overall work)

# Notes

- Be careful and provide evidence when inferring procedures from image analysis.
- Keep terminology beginner-friendly, and add explanatory notes for technical terms whenever possible.
- You may skip representative steps to cover the overall work, but be careful not to miss important procedures.

【Summary】  
Create a beginner-friendly Markdown document that explains procedures, materials, tools, and reasons using timestamp filenames for each image. Pay special attention to the Markdown image embedding part (e.g., \`![](./00-01.jpg)\`) and make sure it is emphasized as "always" included and reflected in the output.

Output language: {language}`;
