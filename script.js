// Alterna tema escuro/clara
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    body.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
});

// Menu mobile
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');
const shadow = document.querySelector('.shadow');
const closeBtn = document.querySelector('.close-btn');

if (hamburger && menu && shadow && closeBtn) {
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('active');
    shadow.style.display = menu.classList.contains('active') ? 'flex' : 'none';
  });
  closeBtn.addEventListener('click', () => {
    menu.classList.remove('active');
    shadow.style.display = 'none';
  });

  // Fechar ao clicar fora do menu, dentro do shadow
  shadow.addEventListener('click', (e) => {
    if (e.target === shadow) {
      menu.classList.remove('active');
      shadow.style.display = 'none';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
const skills = [
  { nome: "HTML", nivel: 90, class: 'Avançado' },
  { nome: "CSS", nivel: 90, class: 'Avançado' },
  { nome: "JavaScript", nivel: 80, class: 'Avançado'  },
  { nome: "PHP", nivel: 75, class: 'Intermediário'  },
  { nome: "Java", nivel: 70, class: 'Intermediário'  },
  { nome: "Python", nivel: 75, class: 'Intermediário'  },
  { nome: "React Native", nivel: 85, class: 'Avançado'  },
  { nome: "Vue", nivel: 35, class: 'Iniciante'  },
  { nome: "Next", nivel: 70, class: 'Intermediário'  }
];

const skillsContainer = document.getElementById("skillsContainer");

skills.forEach(skill => {
  const skillDiv = document.createElement("div");
  skillDiv.classList.add("skill");

  const label = document.createElement("label");
  label.textContent = skill.nome;

  const skillClass = document.createElement("spam");
  skillClass.textContent = skill.class;

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  const progress = document.createElement("div");
  progress.classList.add("progress");
  progress.style.width = "0%"; 
  progress.setAttribute("data-nivel", skill.nivel);

  progressBar.appendChild(progress);
  skillDiv.appendChild(label);
  skillDiv.appendChild(progressBar);
  skillDiv.appendChild(skillClass);
  skillsContainer.appendChild(skillDiv);
});

  setTimeout(() => {
    document.querySelectorAll(".progress").forEach(progress => {
      const finalWidth = progress.getAttribute("data-nivel");
      progress.style.width = finalWidth + "%";
    });
  }, 100);

});