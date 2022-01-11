window.addEventListener('DOMContentLoaded', () => {
	// Part with Tabs
	const tabs = document.querySelectorAll('.tabheader__item')
	const tabsContent = document.querySelectorAll('.tabcontent')
	const tabsParent = document.querySelector('.tabheader__items')

	// скрытие контента
	function hideTabContent() {
		// т.к мы получили html collection через selector можем использовать только forEach
		tabsContent.forEach(item => {
			item.classList.add('hide')
			item.classList.remove('show', 'fade')
		})

		tabs.forEach(item => {
			item.classList.remove('tabheader__item_active')
		})
	}
	// появление элемента с анимацией
	function showTabContent(i = 0) {
		tabsContent[i].classList.add('show', 'fade')
		tabsContent[i].classList.remove('hide')
		tabs[i].classList.add('tabheader__item_active')
	}
	hideTabContent()
	showTabContent()

	tabsParent.addEventListener('click', e => {
		const target = e.target

		if (target && target.classList.contains('tabheader__item')) {
			tabs.forEach((item, i) => {
				if (target == item) {
					hideTabContent()
					showTabContent(i)
				}
			})
		}
	})

	// Part with Timer
	const deadLine = '2022-01-01T00:00:00'

	function getTimeRemaining(endtime) {
		// разница после парсеровки
		const t = Date.parse(endtime) - Date.parse(new Date())
		// получение дней путем деления на милисекунды через округление
		const days = Math.floor(t / (1000 * 60 * 60 * 24))
		const hours = Math.floor((t / (1000 * 60 * 60)) % 24)
		const minutes = Math.floor((t / 1000 / 60) % 60)
		const seconds = Math.floor((t / 1000) % 60)

		return {
			total: t,
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
		}
	}

	function getZero(num) {
		if (num >= 0 && num < 10) {
			return `0${num}`
		} else {
			return num
		}
	}

	function setClock(selector, endtime) {
		const timer = document.querySelector(selector),
			days = timer.querySelector('#days'),
			hours = timer.querySelector('#hours'),
			minutes = timer.querySelector('#minutes'),
			seconds = timer.querySelector('#seconds'),
			timeInterval = setInterval(updateClock, 1000)

		// убираем стартовую верстку - чтоб сразу шел отсчет по скрипту
		updateClock()

		function updateClock() {
			const t = getTimeRemaining(endtime)

			days.innerHTML = getZero(t.days)
			hours.innerHTML = getZero(t.hours)
			minutes.innerHTML = getZero(t.minutes)
			seconds.innerHTML = getZero(t.seconds)

			if (t.total <= 0) {
				clearInterval(timeInterval)
			}
		}
	}

	setClock('.timer', deadLine)

	// Modal window

	const modalTrigger = document.querySelectorAll('[data-modal]')
	const modal = document.querySelector('.modal')

	function openModal() {
		modal.classList.add('show')
		modal.classList.remove('hide')
		// убираем прокрутку страницы при открытой модалки
		document.body.style.overflow = 'hidden'
		clearInterval(modelTimerId)
	}

	modalTrigger.forEach(btn => {
		btn.addEventListener('click', openModal)
	})

	function closeModal() {
		modal.classList.add('hide')
		modal.classList.remove('show')
		document.body.style.overflow = ''
	}

	modal.addEventListener('click', e => {
		if (e.target === modal || e.target.getAttribute('data-close') == '') {
			closeModal()
		}
	})

	document.addEventListener('keydown', e => {
		if (e.code === 'Escape' && modal.classList.contains('show')) {
			closeModal()
		}
	})

	const modelTimerId = setTimeout(openModal, 30000)

	function showModalByScroll() {
		if (
			window.pageYOffset + document.documentElement.clientHeight >=
			document.documentElement.scrollHeight
		) {
			openModal()
			window.removeEventListener('scroll', showModalByScroll)
		}
	}
	// после прокрутки до конца страницы - выводить модалку
	window.addEventListener('scroll', showModalByScroll)

	// Создание классов для карточек
	class MenuCard {
		constructor(src, alt, title, descr, price, parentSelector, ...classes) {
			this.src = src
			this.alt = alt
			this.title = title
			this.descr = descr
			this.price = price
			this.classes = classes
			this.parent = document.querySelector(parentSelector)
			this.transfer = 27
			this.changeToUAH()
		}

		changeToUAH() {
			this.price = this.price * this.transfer
		}

		render() {
			const element = document.createElement('div')
			if (this.classes.length === 0) {
				this.element = 'menu__item'
				element.classList.add(this.element)
			} else {
				this.classes.forEach(className => element.classList.add(className))
			}
			element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `
			this.parent.append(element)
		}
	}

	// откуда/что берем для отрисовки
	const getResource = async url => {
		// т.к. для fetch большинство ошибок это результат, то .catch не сработает, поэтому
		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Could not fetch ${url}, status: ${res.status}`)
		}
		return await res.json()
	}

	getResource('http://localhost:3000/menu').then(data => {
		// деструкторизация помогает сделать DRY с карточками и "пишем куда мы его рендерим"
		data.forEach(({ img, altimg, title, descr, price }) => {
			new MenuCard(
				img,
				altimg,
				title,
				descr,
				price,
				'.menu .container'
			).render()
		})
	})

	// Forms

	const forms = document.querySelectorAll('form')

	const message = {
		loading: 'img/form/loading.gif',
		success: 'Спасибо! Скоро мы с Вами свяжемся',
		failure: 'Что-то пошло не так...',
	}

	forms.forEach(item => {
		bindPostData(item)
	})
	// куда/что отсылаем в синхронном режиме
	const postData = async (url, data) => {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: data,
		})

		return await res.json()
	}

	// функция для привязки данных к серверу
	function bindPostData(form) {
		form.addEventListener('submit', e => {
			e.preventDefault()

			const statusMessage = document.createElement('img')
			statusMessage.src = message.loading
			statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
                margin-top: 20px;                
            `
			// отрисовка спинера после блоков модального окна
			form.insertAdjacentElement('afterend', statusMessage)

			// сбор данных для отправки из формы
			const formData = new FormData(form)

			// создаем объект, который поможет декодировать данные
			const json = JSON.stringify(Object.fromEntries(formData.entries()))

			// отправка данных на сервер
			postData('http://localhost:3000/requests', json)
				.then(data => {
					console.log(data)
					// если после запроса все успешно
					showThanksModal(message.success)
					// очистка блока с сообщением
					statusMessage.remove()
				})
				.catch(() => {
					showThanksModal(message.failure)
				})
				.finally(() => {
					// очистка формы после отправки на сервер
					form.reset()
				})
		})
	}

	function showThanksModal(message) {
		const prevModalDialog = document.querySelector('.modal__dialog')

		prevModalDialog.classList.add('hide')
		openModal()

		const thanksModal = document.createElement('div')
		thanksModal.classList.add('modal__dialog')
		thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close">&times;</div>
            <div class="modal__title">${message}</div>
        </div>
        `
		document.querySelector('.modal').append(thanksModal)
		setTimeout(() => {
			thanksModal.remove()
			prevModalDialog.classList.add('show')
			prevModalDialog.classList.remove('hide')
			closeModal()
		}, 4000)
	}

	fetch('db.json')
		.then(data => data.json())
		.then(res => console.log(res))
})
