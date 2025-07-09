// Text พิมพ์ทีละตัว (Typewriter effect)
const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล \n เพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        const currentChar = text.charAt(index);
        document.getElementById("typeText").innerHTML += currentChar === "\n" ? "<br>" : currentChar;
        index++;
        setTimeout(typeWriter, 60);
    }
}
typeWriter();