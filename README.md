# Naksha Frontend

React 19 storefront built with Vite, Tailwind CSS, React Router, and Zustand. Product, category, cart, wishlist, authentication, order, and store-highlight data are provided by the Naksha REST API.

## API configuration

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the API root, including its version prefix. The current backend defaults to:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Do not put server secrets in Vite environment variables. The frontend uses the API's bearer-token authentication and stores the session in browser local storage because the backend exposes tokens rather than an HttpOnly-cookie flow.

## Integration map

| Frontend surface | API contract |
| --- | --- |
| Home collection cards and footer | `GET /categories`; `GET /highlights` |
| Home best sellers and shop search/filter/sort/paging | `GET /products` with `tag`, `category`, `search`, `sort_by`, `limit`, and `offset` |
| Product detail | `GET /products/{id}` |
| Account sign-in, registration, email verification, sign-out, current profile | `POST /auth/login`, `POST /auth/register`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/refresh` |
| Shopping bag | `GET /cart`, `POST /cart/items`, `PUT /cart/items/{item_id}`, `DELETE /cart/items/{item_id}` |
| Wishlist | `GET /wishlist`, `POST /wishlist/toggle/{product_id}` |
| Checkout and order confirmation | `POST /orders`, `GET /orders/{id}` |

The API currently seeds Bras, Panties, Sexy Lingerie, Baby Dolls, Nightwear, and Shapewear. Its product schema exposes one image and no variant, color, or garment-detail fields; the frontend therefore displays only catalog-provided fields and sends the API's standard `M` size for cart items. The backend records a payment method but does not process online payments. Product/category admin CRUD, order-history management, newsletter, and contact screens are not present in this frontend.

## Run locally

Install and run the frontend from the repository root:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Run the companion backend in a separate PowerShell window from its repository:

```powershell
Set-Location C:\path\to\Naksha_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
python run.py
```

The backend's default API documentation is available at `http://127.0.0.1:8000/docs`. Run the frontend checks with `npm run lint` and `npm run build`; run backend tests from the backend repository with `python -m pytest tests/test_api.py -v`.
