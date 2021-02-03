import { EmojiButton } from '@joeattardi/emoji-button'

window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#divOutside')
    const picker = new EmojiButton()

    picker.on('emoji', (emoji) => {
        console.log(emoji)
        document.querySelector('#msg').value += emoji.emoji
    })
    try {
        button.addEventListener('click', () => {
            picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button)
        })
    } catch (err) {
        console.log('No Smily div found')
    }

    console.log('Done')
})