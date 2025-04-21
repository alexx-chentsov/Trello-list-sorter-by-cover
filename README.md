# Trello-list-sorter-by-cover

# Kinda docs, mostly from gpt


To build a “Sort by Cover Color” you can write a small Trello Power‑Up that uses the **list‑sorters** capability. The high‑level steps are:


1. Deploy this repo via gh pages, server root dir from main branch

2. **Create & register your Power‑Up**  
   1. Go to [https://trello.com/power‑ups/admin](https://trello.com/power-ups/admin) and create a new Power‑Up.  
   2. Under **Capabilities**, enable **list‑sorters**.  
   3. Point its **Connector URL** at a simple HTTPS‑hosted JavaScript file (e.g. on Netlify, GitHub Pages, etc.). - just point to root dir of repo that serves index.html by default

3. On your board, enable the Power‑Up.  

4. **Use it**  
   - Open any list’s menu (`…`), choose **Sort By… → Cover Color**, and voilà—your cards will be reordered by cover color.
