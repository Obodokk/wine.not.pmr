document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('order-form');
  const BOT_TOKEN = '7865197370:AAEzaD6VKlIcXAnYOd4fpsM3WuSH-II1VDw';
  const CHAT_ID = '7865197370';

  // Показываем сохраненный дизайн
  const canvas = new fabric.Canvas('design-preview');
  const savedDesign = localStorage.getItem('glassDesign');

  if (savedDesign) {
    const design = JSON.parse(savedDesign);

    // Загрузка бокала
    fabric.Image.fromURL(`images/${design.glassType}-glass.png`, function(img) {
      img.scaleToWidth(300);
      canvas.add(img);

      // Загрузка текста
      if (design.text) {
        const text = new fabric.Text(design.text, {
          fontFamily: design.font,
          fontSize: 20,
          fill: '#000000',
          left: 150,
          top: 150,
          originX: 'center',
          originY: 'center'
        });
        canvas.add(text);
      }

      // Загрузка изображения
      if (design.image) {
        fabric.Image.fromURL(`images/${design.image}`, function(img) {
          img.set({
            scaleX: 0.3,
            scaleY: 0.3,
            left: 100,
            top: 100,
            originX: 'center',
            originY: 'center'
          });
          canvas.add(img);
        });
      }
    });
  }

  // Отправка заказа
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      social: form.elements.social.value,
      address: form.elements.address.value,
      comments: form.elements.comments.value,
      design: savedDesign ? JSON.parse(savedDesign) : null,
      date: new Date().toLocaleString()
    };

    // Форматируем сообщение для Telegram
    const message = `📦 *Новый заказ* \n\n` +
                   `👤 *Имя*: ${formData.name}\n` +
                   `📞 *Телефон*: ${formData.phone}\n` +
                   `💬 *Соцсеть*: ${formData.social}\n` +
                   `🏠 *Адрес*: ${formData.address || 'Не указан'}\n` +
                   `💭 *Комментарий*: ${formData.comments || 'Нет комментариев'}\n\n` +
                   `🛒 *Детали заказа*:\n` +
                   `- Бокал: ${formData.design?.glassType || 'Не указан'}\n` +
                   `- Текст: ${formData.design?.text || 'Нет текста'}\n` +
                   `- Шрифт: ${formData.design?.font || 'Не указан'}\n` +
                   `- Изображение: ${formData.design?.image ? 'Да' : 'Нет'}\n\n` +
                   `⏰ *Дата*: ${formData.date}`;

    try {
      // Отправка в Telegram
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        alert('✅ Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
        form.reset();
        localStorage.removeItem('glassDesign');
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('⚠️ Произошла ошибка при отправке заказа. Пожалуйста, свяжитесь с нами напрямую.');
    }
  });
});