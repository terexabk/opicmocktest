# Hướng Dẫn Deploy Lên Koyeb Miễn Phí

## 🌟 Tại Sao Chọn Koyeb?

- ✅ **Hoàn toàn miễn phí** cho combo service
- ✅ **Không bị sleep** như Render
- ✅ **Tự động deploy** từ GitHub
- ✅ **HTTPS miễn phí**
- ✅ **Docker support**
- ✅ **Global CDN**

---

## 📋 Yêu Cầu

1. Tài khoản GitHub
2. Source code đã push lên GitHub repository
3. Tài khoản Koyeb (miễn phí)

---

## 🚀 Bước 1: Chuẩn Bị Code

### 1.1. Tạo Repository Trên GitHub

```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Initial commit for Koyeb deployment"

# Tạo repo trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 1.2. Đảm Bảo Có Các File

- ✅ `package.json`
- ✅ `Dockerfile` (đã tạo sẵn)
- ✅ `.dockerignore` (đã tạo sẵn)
- ✅ `app.js`
- ✅ `.gitignore` (không commit file .env)

---

## 🌐 Bước 2: Đăng Ký Koyeb

1. Truy cập: https://www.koyeb.com/
2. Click "Get Started"
3. Đăng ký bằng GitHub (khuyên dùng)
4. Verify email

---

## 🎯 Bước 3: Deploy Trên Koyeb

### 3.1. Tạo Koyeb App

1. Vào Dashboard → Click "Create App"
2. Chọn "GitHub" → Chọn repository của bạn
3. Chọn branch `main` (hoặc branch bạn muốn deploy)

### 3.2. Cấu Hình Build Settings

**Build Command:**
```
npm install
```

**Run Command:**
```
node app.js
```

**Port:**
```
3000
```

### 3.3. Thêm Environment Variables

Click "Environment Variables" và thêm:

```
OPENAI_API_KEY = sk-your-key-here
SESSION_SECRET = your-random-secret-key
MONGODB_URI = mongodb+srv://...
```

**Lưu ý:**
- `SESSION_SECRET`: Tạo random string bất kỳ
- `MONGODB_URI`: Sử dụng MongoDB Atlas connection string

### 3.4. Deploy

1. Click "Deploy"
2. Chờ build và deploy (3-5 phút)
3. Nhận URL: `https://your-app-name.koyeb.app`

---

## 🗄️ Bước 4: Setup MongoDB Atlas (Nếu Chưa Có)

### 4.1. Tạo Tài Khoản

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký miễn phí
3. Chọn "Free Shared" cluster

### 4.2. Cấu Hình

1. **Network Access:**
   - Add IP: `0.0.0.0/0` (cho phép tất cả)

2. **Database Access:**
   - Create user
   - Username: `dbOpicKorea` (hoặc tự chọn)
   - Password: Ghi nhớ password

3. **Get Connection String:**
   - Click "Connect"
   - Chọn "Connect your application"
   - Copy connection string
   - Thay thế `<password>` bằng password vừa tạo

**Ví dụ:**
```
mongodb+srv://dbOpicKorea:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/opic_korean?retryWrites=true&w=majority
```

### 4.3. Thêm Vào Koyeb

- Thêm vào Environment Variables trên Koyeb

---

## 🔧 Cấu Hình SSL & Domain (Tùy chọn)

### 5.1. SSL Miễn Phí

- Koyeb tự động cung cấp HTTPS miễn phí
- Không cần cấu hình thêm

### 5.2. Custom Domain

1. Vào App Settings → Domains
2. Add custom domain
3. Cấu hình DNS theo hướng dẫn

---

## 🔄 Auto-Deploy

- **Tự động deploy** mỗi khi push code lên GitHub
- **Manual deploy** nếu cần từ Koyeb dashboard

---

## 📊 Monitoring & Logs

### Xem Logs

1. Vào Dashboard → Chọn App
2. Click "Logs"
3. Xem real-time logs

### Metrics

- CPU usage
- Memory usage
- Network traffic
- Request count

---

## 🆘 Khắc Phục Sự Cố

### Build Failed

**Kiểm tra:**
```bash
# Local test
npm install
node app.js
```

**Logs trên Koyeb:**
- Vào Logs tab để xem chi tiết lỗi

### App Không Start

**Check:**
1. Environment variables đã set đúng chưa
2. PORT có đúng không (thường là 3000)
3. MongoDB connection string

### 404 Errors

**Kiểm tra:**
- Routes đã được import đúng
- Static files path

---

## 💰 Koyeb Pricing

### Free Tier
- ✅ 2 Apps
- ✅ 512MB RAM per app
- ✅ 0.1 vCPU
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Không sleep

**Giới hạn:**
- 2 apps maximum
- Chỉ dùng được Docker (không dùng Native)

---

## 📝 Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] MongoDB Atlas đã setup
- [ ] IP whitelist đã cấu hình
- [ ] Environment variables đã thêm
- [ ] Dockerfile có trong repo
- [ ] Build thành công
- [ ] App chạy được

---

## 🔗 Liên Kết

- [Koyeb Dashboard](https://app.koyeb.com/)
- [Koyeb Docs](https://www.koyeb.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 💡 Tips

1. **Development:**
   - Test local trước khi push
   - Check logs thường xuyên

2. **Production:**
   - Sử dụng Production ready database
   - Enable monitoring

3. **Security:**
   - Không commit `.env` file
   - Sử dụng strong SESSION_SECRET

---

## 🎉 Xong!

Sau khi deploy thành công, bạn sẽ có:
- URL: `https://your-app.koyeb.app`
- HTTPS miễn phí
- Auto-deploy từ GitHub
- Không bị sleep

**Chúc bạn deploy thành công! 🚀**

