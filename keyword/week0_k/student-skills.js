const student = {
  name: "광수",
  skills: ["HTML", "CSS", "JavaScript"],
};

function printSkills(skills) {
  for (const skill of skills) {
    if (skill === "JavaScript") {
      console.log(`${skill}: 화면에 동작을 더합니다.`);
    } else {
      console.log(skill);
    }
  }
}

console.log(student.name);
printSkills(student.skills);
