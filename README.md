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
| Guest identity and cart | `POST /session/` once per browser profile; send the stored `X-Guest-ID` on cart requests |
| Checkout, promotions, and order confirmation | `POST /cart/quote/`, `POST /orders`, `GET /orders/{id}` (all with `X-Guest-ID`) |
| Razorpay sandbox checkout | `POST /orders/{id}/payment/`, `POST /orders/{id}/payment/verify/` (with `X-Guest-ID`); provider webhooks are server-only |
| Staff administration | `/admin/login`, then `/admin/dashboard`, `/admin/products`, `/admin/categories`, `/admin/customers`, `/admin/orders`, `/admin/payments`, and `/admin/offers` |
| Admin API | Staff-only `/admin/dashboard/`, `/admin/products/`, `/admin/categories/`, `/admin/customers/`, `/admin/orders/`, `/admin/offers/`, image upload, and refund endpoints |

The browser provisions one guest identity with `POST /session/`, persists its `guestId`, and sends `X-Guest-ID` consistently on cart, coupon, order, and payment requests. Sign-in does not replace that commerce identity. The staff dashboard uses a separate username/password login and requires the current `/auth/me/` response to confirm `isStaff: true`; the backend independently rechecks staff permission on every admin request. Configure no payment secrets in Vite: Razorpay checkout uses the public test `keyId` returned by the API, and payment verification happens server-side. Products, categories, customers, orders, refunds, and scheduled coupon offers are managed through the admin route family without changing the storefront shell.

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
