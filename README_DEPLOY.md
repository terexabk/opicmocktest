# Hướng Dẫn Deploy Miễn Phí

## Các Lựa Chọn Deploy Miễn Phí

### 1. Render.com (Khuyên dùng)

#### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [render.com](https://render.com)
2. Connect GitHub repository của bạn

#### Bước 2: Deploy
1. Vào Dashboard > New > Web Service
2. Connect repository của bạn
3. Cấu hình Seed và Start:
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
4. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `MONGODB_URI`: Your MongoDB connection string
   - `SESSION_SECRET`: A random string for session security
5. Click "Create Web Service"

#### Bước 3: Setup MongoDB Atlas (Miễn phí)
1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster miễn phí
3. Add IP whitelist: `0.0.0.0/0`
4. Create user
5. Copy connection string

**Lưu ý Render:**
- Plan miễn phí tự động sleep sau 15 phút không sử dụng
- Lần đầu load sau khi sleep sẽ chậm (~30 giây)
- Giới hạn 750 giờ/tháng

---

### 2. Railway.app (Miễn phí)

#### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [railway.app](https://railway.app)
2. Login bằng GitHub

#### Bước 2: Deploy
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Add Environment Variables:
   - `OPENAI_API_KEY`
   - `MONGODB_URI`
   - `SESSION_SECRET`
5. Deploy tự động

**Lưu ý Railway:**
- $5 credit miễn phí mỗi tháng
- Tự động scale up/down
- Không sleep như Render

---

### 3. Heroku (Miễn phí - đã dừng)

Heroku đã dừng plan miễn phí. Không khuyên dùng.

---

## File Cần Thiết

Đảm bảo có các file sau trong project:
- ✅ `package.json` - Dependencies
- ✅ `Procfile` - Start command for Heroku
- ✅ `render.yaml` - Config for Render
- ✅ `.env` - Không commit file này!

---

## Environment Variables Cần Thiết

```env
PORT=3000 (auto-set bởi hosting platform)
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=random-secret-string
```

---

## Khắc Phục Sự Cố

### Lỗi "Cannot find module"
- Kiểm tra `package.json` có đầy đủ dependencies
- Chạy `npm install` ở môi trường local để test

### Lỗi "Port already in use"
- Đổi PORT trong `.env` file

### Lỗi MongoDB Connection
- Kiểm tra MongoDB Atlas đã whitelist IP
- Verify username/password

### Audio files không lưu
- Kiểm tra thư mục `public/result_audio` có tồn tại
- Check permissions

---

## Tips

1. **Security**: 
   - Không commit `.env` file
   - Sử dụng `.gitignore`

2. **Performance**:
   - Cache static files
   - Optimize database queries

3. **Monitoring**:
   - Setup logging
   - Monitor errors

4. **Backup**:
   - Regular backup MongoDB
   - Keep code in GitHub

---

## Liên Kết Hữu Ích

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

