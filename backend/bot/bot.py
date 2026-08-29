import logging
import random
import string
import json
import os
from datetime import datetime, timedelta
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
from cryptography.fernet import Fernet

TOKEN = "8743616862:AAHuCUK9ySpAFGqdhrxXnbgsuyP7t7Hnyz8"
ADMIN_ID = 7994843509
ENCRYPTION_KEY = b'3ZAX-JIA5PSPQxYKv0Tsxtml-Y6kRAHzIqRc2pvBkDI='
cipher = Fernet(ENCRYPTION_KEY)

DB_FILE = "licenses.json"

# Tere website ke tools
TOOLS = ["hologram", "magic", "zombie", "arrow", "laser", "laser2", "laser3", "card", "shop", "paidpush"]

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4, default=str)

licenses = load_db()
logging.basicConfig(level=logging.INFO)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🔥 Hologram", callback_data="holo")],
        [InlineKeyboardButton("💥 Magic Bullet 600%", callback_data="magic600")],
        [InlineKeyboardButton("🧟 Zombie Series", callback_data="zombie")],
        [InlineKeyboardButton("📍 Full Location Pack", callback_data="location")],
        [InlineKeyboardButton("🚀 Paid Push", callback_data="push")],
        [InlineKeyboardButton("🔑 Redeem Key", callback_data="redeem")]
    ]
    markup = InlineKeyboardMarkup(keyboard)

    with open("sQz8x (1).jpg", "rb") as f:
        await update.message.reply_photo(f, caption="**VOIDXHUB ILLEGAL BOT** 🔥\nTere website ka sabse powerful bot", reply_markup=markup, parse_mode='Markdown')

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    cd = query.data

    if cd == "holo":
        await send_hack(query, "hologram", "Full Body Hologram + 80% Drag")
    elif cd == "magic600":
        await send_hack(query, "magic", "Magic Bullet 600%")
    elif cd == "zombie":
        await send_hack(query, "zombie", "Zombie Magic Bullet")
    elif cd == "location":
        await query.message.reply_text("Sending Full Location Pack...")
        for f in ["arrow", "laser", "laser2", "laser3", "card", "shop"]:
            await send_hack(query, f, f"{f.upper()} Location")
    elif cd == "push":
        await query.message.reply_text("Paid Push ₹299\nUPI: voidxhub@upi\nProof bhej yaha")
    elif cd == "redeem":
        await query.message.reply_text("Apni License Key yaha paste kar do 👇")

async def send_hack(query, folder, caption):
    try:
        path = f"{folder}/hack.zip"
        if os.path.exists(path):
            with open(path, "rb") as f:
                encrypted = cipher.encrypt(f.read())
            await query.message.reply_document(encrypted, filename=f"{folder}_hack.zip", caption=f"🔥 {caption}\nDelivered by VOIDXHUB 💀")
        else:
            await query.message.reply_text(f"❌ {folder} folder mein hack.zip nahi mila")
    except Exception as e:
        await query.message.reply_text(f"Error: {str(e)}")

async def handle_key(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Tera purana key redeem logic yaha daal sakta hai
    await update.message.reply_text("Key system abhi under maintenance hai. Button se direct download kar lo.")

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_key))
    
    print("✅ VOIDXHUB Top Tier Bot Live Ho Gaya")
    app.run_polling()

if __name__ == '__main__':
    main()
