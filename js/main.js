console.log('main.js подключен');

const { jsPDF } = window.jspdf;  // Получаем объект jsPDF из window.jspdf

// Загружаем данные из JSON
fetch('./data.json')
  .then((response) => response.json())
  .then((data) => {
    // Логирование данных для проверки
    console.log('Данные из JSON:', data);

    const menuContainer = document.getElementById('menu');
    
    // Создание HTML меню
    data.menu.forEach((section) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'bg-white p-4 rounded-lg shadow-md';
      
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'text-2xl font-bold mb-4';
      sectionTitle.textContent = section.section;

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'grid grid-cols-1 gap-4';

      section.items.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 bg-gray-50 rounded-lg shadow';
        
        itemDiv.innerHTML = `
          <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
          <p class="text-sm text-gray-600">${item.description}</p>
          <p class="text-sm text-gray-500">${item.weight}</p>
          <p class="text-lg font-bold mt-2">${item.price}</p>
        `;
        
        itemsDiv.appendChild(itemDiv);
      });

      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(itemsDiv);
      menuContainer.appendChild(sectionDiv);
    });
  })
  .catch((error) => console.error('Ошибка при загрузке данных из JSON:', error));

// Генерация PDF
document.getElementById('downloadPDF').addEventListener('click', () => {
  const doc = new jsPDF();
  let yPosition = 10;  // Начальная позиция для текста

  fetch('./data.json')
    .then((response) => response.json())
    .then((data) => {
      // Логирование данных для проверки
      console.log('Данные для PDF:', data);

      // Обработка меню и добавление в PDF
      data.menu.forEach((section, index) => {
        if (index > 0) {
          doc.addPage();
          yPosition = 10; // Сброс позиции после добавления новой страницы
        }

        // Заголовок раздела
        doc.setFontSize(18);
        doc.text(section.section, 10, yPosition);
        yPosition += 10;

        // Если в категории больше 14 позиций, разделим на несколько столбиков
        const maxItemsPerColumn = 14;  // Максимальное количество элементов в одном столбце
        const columnWidth = 85;        // Ширина каждого столбца (если хотим 2 столбца на странице)
        const columns = 2;             // Количество столбцов на странице
        const margin = 10;             // Отступы

        let currentColumn = 0;         // Переменная для отслеживания текущего столбца
        let startX = margin;           // Начальная позиция по X для первого столбца
        let startY = yPosition;        // Начальная позиция по Y

        // Разбиваем элементы на столбцы
        section.items.forEach((item, i) => {
          if (i % maxItemsPerColumn === 0 && i > 0) {
            // Перемещаем на новый столбец или страницу
            currentColumn++;
            if (currentColumn >= columns) {
              currentColumn = 0;
              doc.addPage(); // Добавляем новую страницу, если все столбцы заполнены
              startY = 10; // Сбрасываем Y позицию
            }
            startX = margin + currentColumn * columnWidth; // Сдвигаем позицию по X для нового столбца
          }

          // Отображаем информацию о блюде
          doc.setFontSize(12);
          doc.text(`${item.title} (${item.weight}) — ${item.price}`, startX, startY);
          startY += 10;
          doc.text(item.description, startX, startY);
          startY += 10;
        });
      });

      // Сохранение PDF
      doc.save('menu.pdf');
    })
    .catch((error) => console.error('Ошибка при генерации PDF:', error));
});
