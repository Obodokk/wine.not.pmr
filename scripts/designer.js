document.addEventListener('DOMContentLoaded', function() {
  // Инициализация Canvas
  const canvas = new fabric.Canvas('glass-preview', {
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
    selection: true,
    uniformScaling: false,
    controlsAboveOverlay: true
  });

  // Состояние приложения
  const state = {
    glassType: 'wine',
    texts: [],
    activeTextId: null,
    font: 'Arial',
    fontSize: 24,
    color: '#8f8f8f',
    textAlign: 'center',
    activeTool: 'select',
    template: null,
    zoom: 1,
    cliparts: [],
    nextId: 1,
    currentTemplate: null
  };

  // Элементы интерфейса
  const elements = {
    engravingText: document.getElementById('engraving-text'),
    fontSelect: document.getElementById('font-select'),
    fontSizeInput: document.getElementById('font-size'),
    fontSizeValue: document.getElementById('font-size-value'),
    colorOptions: document.querySelectorAll('.color-option'),
    alignButtons: document.querySelectorAll('.text-align-buttons button'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    toolButtons: document.querySelectorAll('.tool-button'),
    previewContainer: document.getElementById('glass-preview-container'),
    addTextBtn: document.getElementById('add-text-btn'),
    textList: document.getElementById('text-list'),
    zoomSlider: document.getElementById('zoom-slider'),
    zoomValue: document.getElementById('zoom-value')
  };

  // Настройка контролов для объектов
  fabric.Object.prototype.set({
    borderColor: '#6a5acd',
    cornerColor: '#6a5acd',
    cornerSize: 12,
    transparentCorners: false,
    cornerStyle: 'circle',
    borderScaleFactor: 2,
    padding: 10
  });

  // Инициализация размеров Canvas
  function initCanvasSize() {
    const container = elements.previewContainer;
    canvas.setWidth(container.clientWidth);
    canvas.setHeight(Math.min(container.clientWidth * 1.5, 600));
    canvas.renderAll();
    updateZoom();
  }

  // Обновление зума
  function updateZoom() {
    canvas.setZoom(state.zoom);
    elements.zoomValue.textContent = Math.round(state.zoom * 100) + '%';
    canvas.renderAll();
  }

  // Загрузка изображения бокала
  function loadGlass(glassType) {
    state.glassType = glassType;
    fabric.Image.fromURL(`images/${glassType}-glass.png`, function(img) {
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      ) * 0.9;

      img.scale(scale);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2
      });
      updateZoom();
    }, { crossOrigin: 'anonymous' });
  }

  // Загрузка шаблона с исправлением проблемы выбора
  function loadTemplate(templateName) {
    if (state.template) {
      canvas.remove(state.template);
      state.template = null;
    }

    if (templateName !== 'none') {
      fabric.Image.fromURL(`images/templates/${templateName}`, function(img) {
        const scale = Math.min(
          canvas.width * 0.7 / img.width,
          canvas.height * 0.7 / img.height
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockRotation: true,
          lockUniScaling: false,
          cornerStyle: 'circle',
          cornerColor: '#6a5acd',
          cornerSize: 12,
          transparentCorners: false,
          borderColor: '#6a5acd',
          borderScaleFactor: 2,
          padding: 10
        });

        state.template = img;
        state.currentTemplate = templateName;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        updateZoom();
      }, { crossOrigin: 'anonymous' });
    } else {
      state.currentTemplate = 'none';
      document.querySelector('.tab-btn[data-tab="elements-tab"]').click();
    }
  }

  // Добавление нового текстового блока
  function addNewText() {
    const textId = state.nextId++;
    const textObj = {
      id: textId,
      text: 'Новый текст',
      fontFamily: state.font,
      fontSize: state.fontSize,
      fill: state.color,
      textAlign: state.textAlign,
      left: canvas.width / 2,
      top: canvas.height / 2
    };

    const fabricText = new fabric.Textbox(textObj.text, {
      left: textObj.left,
      top: textObj.top,
      width: canvas.width * 0.8,
      originX: 'center',
      originY: 'center',
      fontFamily: textObj.fontFamily,
      fontSize: textObj.fontSize,
      fill: textObj.fill,
      textAlign: textObj.textAlign,
      selectable: true,
      hasControls: true,
      splitByGrapheme: true,
      data: { id: textId },
      cornerStyle: 'circle',
      cornerColor: '#6a5acd',
      cornerSize: 12,
      transparentCorners: false,
      borderColor: '#6a5acd',
      borderScaleFactor: 2,
      padding: 10
    });

    state.texts.push({ id: textId, fabricObj: fabricText, data: textObj });
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    updateTextList();
    state.activeTextId = textId;
    updateActiveTextControls();
  }

  // Обновление текста
  function updateText() {
    if (!state.activeTextId) return;

    const textObj = state.texts.find(t => t.id === state.activeTextId);
    if (!textObj) return;

    textObj.fabricObj.set({
      text: elements.engravingText.value,
      fontFamily: state.font,
      fontSize: state.fontSize,
      fill: state.color,
      textAlign: state.textAlign
    });

    textObj.data.text = elements.engravingText.value;
    textObj.data.fontFamily = state.font;
    textObj.data.fontSize = state.fontSize;
    textObj.data.fill = state.color;
    textObj.data.textAlign = state.textAlign;

    canvas.renderAll();
  }

  // Удаление текста
  function removeText(textId) {
    const textIndex = state.texts.findIndex(t => t.id === textId);
    if (textIndex === -1) return;

    canvas.remove(state.texts[textIndex].fabricObj);
    state.texts.splice(textIndex, 1);
    canvas.renderAll();
    updateTextList();

    if (state.activeTextId === textId) {
      state.activeTextId = state.texts.length > 0 ? state.texts[0].id : null;
      updateActiveTextControls();
    }
  }

  // Обновление списка текстов
  function updateTextList() {
    elements.textList.innerHTML = '';

    state.texts.forEach(textObj => {
      const li = document.createElement('li');
      li.className = 'text-item';
      if (textObj.id === state.activeTextId) {
        li.classList.add('active');
      }

      li.innerHTML = `
        <span>${textObj.data.text.substring(0, 15) + (textObj.data.text.length > 15 ? '...' : '')}</span>
        <button class="delete-text-btn" data-id="${textObj.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;

      li.addEventListener('click', () => {
        state.activeTextId = textObj.id;
        updateActiveTextControls();
        canvas.setActiveObject(textObj.fabricObj);
        canvas.renderAll();
        updateTextList();
      });

      elements.textList.appendChild(li);
    });
  }

  // Обновление контролов для активного текста
  function updateActiveTextControls() {
    if (!state.activeTextId) {
      elements.engravingText.value = '';
      return;
    }

    const textObj = state.texts.find(t => t.id === state.activeTextId);
    if (!textObj) return;

    elements.engravingText.value = textObj.data.text;
    elements.fontSelect.value = textObj.data.fontFamily;
    elements.fontSizeInput.value = textObj.data.fontSize;
    elements.fontSizeValue.textContent = textObj.data.fontSize;

    document.querySelectorAll('.color-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.color === textObj.data.fill) {
        opt.classList.add('selected');
      }
    });

    document.querySelectorAll('.text-align-buttons button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.align === textObj.data.textAlign) {
        btn.classList.add('active');
      }
    });
  }

  // Добавление клипарта с исправленным позиционированием
  function addClipart(clipartName) {
    fabric.Image.fromURL(`images/cliparts/${clipartName}`, function(img) {
      const scale = Math.min(
        canvas.width * 0.3 / img.width,
        canvas.height * 0.3 / img.height
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: true,
        lockUniScaling: false,
        cornerStyle: 'circle',
        cornerColor: '#6a5acd',
        cornerSize: 12,
        transparentCorners: false,
        borderColor: '#6a5acd',
        borderScaleFactor: 2,
        padding: 10
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      state.cliparts.push(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }

  // Режим ластика
  function setupEraser() {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    canvas.freeDrawingBrush.width = 15;
    canvas.freeDrawingBrush.color = 'rgba(255,255,255,1)';
    state.activeTool = 'eraser';
    canvas.renderAll();
  }

  // Отключение ластика
  function disableEraser() {
    canvas.isDrawingMode = false;
    state.activeTool = 'select';
    canvas.renderAll();
  }

  // Управление слоями
  function manageLayers(action) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    switch(action) {
      case 'bring-to-front':
        activeObject.bringToFront();
        break;
      case 'send-to-back':
        activeObject.sendToBack();
        break;
    }
    canvas.renderAll();
  }

  // Красивое оповещение
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Сохранение дизайна
  function saveDesign() {
    const designData = {
      glassType: state.glassType,
      texts: state.texts.map(t => t.data),
      template: state.currentTemplate,
      cliparts: state.cliparts.length
    };

    localStorage.setItem('glassDesign', JSON.stringify(designData));
    showNotification('Дизайн сохранен! Теперь вы можете перейти к оформлению заказа.');
  }

  // Загрузка сохраненного дизайна
  function loadSavedDesign() {
    const savedDesign = localStorage.getItem('glassDesign');
    if (!savedDesign) return;

    const design = JSON.parse(savedDesign);
    state.glassType = design.glassType;

    document.querySelector(`.glass-options .option-card[data-glass="${design.glassType}"]`)?.click();

    if (design.template && design.template !== 'none') {
      setTimeout(() => {
        document.querySelector(`.template-options .option-card[data-template="${design.template}"]`)?.click();
      }, 500);
    }

    if (design.texts && design.texts.length > 0) {
      setTimeout(() => {
        design.texts.forEach(textData => {
          const textId = state.nextId++;
          const fabricText = new fabric.Textbox(textData.text, {
            left: textData.left || canvas.width / 2,
            top: textData.top || canvas.height / 2,
            width: canvas.width * 0.8,
            originX: 'center',
            originY: 'center',
            fontFamily: textData.fontFamily || 'Arial',
            fontSize: textData.fontSize || 24,
            fill: textData.fill || '#8f8f8f',
            textAlign: textData.textAlign || 'center',
            selectable: true,
            hasControls: true,
            splitByGrapheme: true,
            data: { id: textId },
            cornerStyle: 'circle',
            cornerColor: '#6a5acd',
            cornerSize: 12,
            transparentCorners: false,
            borderColor: '#6a5acd',
            borderScaleFactor: 2,
            padding: 10
          });

          state.texts.push({
            id: textId,
            fabricObj: fabricText,
            data: textData
          });
          canvas.add(fabricText);
        });

        if (state.texts.length > 0) {
          state.activeTextId = state.texts[0].id;
          updateActiveTextControls();
          updateTextList();
        }
      }, 1000);
    }
  }

  // Обработчики событий
  function setupEventListeners() {
    // Изменение размера окна
    window.addEventListener('resize', function() {
      initCanvasSize();
      loadGlass(state.glassType);
      canvas.renderAll();
    });

    // Выбор бокала
    document.querySelectorAll('.glass-options .option-card').forEach(option => {
      option.addEventListener('click', function() {
        document.querySelectorAll('.glass-options .option-card').forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        loadGlass(this.dataset.glass);
      });
    });

    // Выбор шаблона (исправленная версия)
    document.querySelectorAll('.template-options .option-card').forEach(option => {
      option.addEventListener('click', function() {
        document.querySelectorAll('.template-options .option-card').forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        loadTemplate(this.dataset.template);
      });
    });

    // Выбор клипарта (исправленная версия)
    document.querySelectorAll('.cliparts-options .option-card').forEach(option => {
      option.addEventListener('click', function() {
        addClipart(this.dataset.clipart);
      });
    });

    // Добавление нового текста
    elements.addTextBtn?.addEventListener('click', addNewText);

    // Удаление текста
    document.addEventListener('click', function(e) {
      if (e.target.closest('.delete-text-btn')) {
        const textId = parseInt(e.target.closest('.delete-text-btn').dataset.id);
        removeText(textId);
      }
    });

    // Ввод текста
    elements.engravingText.addEventListener('input', function() {
      updateText();
    });

    // Выбор шрифта
    elements.fontSelect.addEventListener('change', function() {
      state.font = this.value;
      updateText();
    });

    // Размер текста
    elements.fontSizeInput.addEventListener('input', function() {
      state.fontSize = parseInt(this.value);
      elements.fontSizeValue.textContent = state.fontSize;
      updateText();
    });

    // Цвет текста
    elements.colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        elements.colorOptions.forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        state.color = this.dataset.color;
        updateText();
      });
    });

    // Выравнивание текста
    elements.alignButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        state.textAlign = this.dataset.align;
        updateText();
      });
    });

    // Переключение вкладок
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;

        elements.tabButtons.forEach(b => b.classList.remove('active'));
        elements.tabContents.forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Инструменты
    elements.toolButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        elements.toolButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const tool = this.id.replace('-btn', '');
        state.activeTool = tool;

        switch(tool) {
          case 'select':
            disableEraser();
            canvas.selection = true;
            break;
          case 'eraser':
            setupEraser();
            break;
          case 'delete':
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              if (activeObject.data?.id) {
                removeText(activeObject.data.id);
              } else {
                canvas.remove(activeObject);
              }
            }
            break;
          case 'bring-to-front':
            manageLayers('bring-to-front');
            break;
          case 'send-to-back':
            manageLayers('send-to-back');
            break;
        }
      });
    });

    // Сохранение дизайна
    document.getElementById('save-design')?.addEventListener('click', saveDesign);

    // Зум
    elements.zoomSlider?.addEventListener('input', function() {
      state.zoom = parseFloat(this.value);
      updateZoom();
    });

    // Выделение объекта на canvas
    canvas.on('selection:created', function() {
      const activeObject = canvas.getActiveObject();
      if (activeObject?.data?.id) {
        state.activeTextId = activeObject.data.id;
        updateActiveTextControls();
        updateTextList();
      }
    });

    canvas.on('selection:cleared', function() {
      state.activeTextId = null;
      updateActiveTextControls();
      updateTextList();
    });
  }

  // Инициализация
  function init() {
    initCanvasSize();
    setupEventListeners();
    loadGlass(state.glassType);
    loadSavedDesign();
  }

  init();
});