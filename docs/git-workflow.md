# 🧩 BugBusters — Git Workflow

Este documento explica o fluxo de trabalho oficial do time no Git.

## 📌 Visão geral

- Cada tarefa = 1 branch nova  
- A `main` sempre contém o código estável  
- Pull Requests são obrigatórios  
- O owner revisa e faz o merge  
- Todo dev deve sincronizar sua main antes de criar uma nova branch  

![Diagrama](../documentation/workflow-diagram.png)


## ✔ Passo a passo resumido

### 1. Antes de codar
```
git checkout main
git pull origin main
git checkout -b feature/nome-da-tarefa
```

### 2. Durante a tarefa

```
git add .
git commit -m "feat: descrição da tarefa"
git push origin feature/nome-da-tarefa
```

### 3. Abrir o Pull Request

- Vai no GitHub

- Clica em "Compare & Pull Request"

### 4. Owner revisa e faz o merge

### 5. Integrante limpa a branch local
```
git checkout main
git pull origin main
git branch -d feature/nome-da-tarefa
```


