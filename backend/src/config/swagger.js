/**
 * KrishiDirect OpenAPI 3.0 Specification Configuration
 * Supports Live Deployed API (Render) and Local Development
 */

const getSwaggerSpec = (port = process.env.PORT || 5000) => {
  const liveUrl = process.env.API_BASE_URL || process.env.RENDER_EXTERNAL_URL || 'https://krishidirect-api.onrender.com';
  const localUrl = `http://localhost:${port}`;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, live URL is the primary server; in development, both are provided
  const servers = isProduction
    ? [
        {
          url: liveUrl,
          description: 'Live Production Server (Render Deployed API)'
        },
        {
          url: localUrl,
          description: 'Local Development Server'
        }
      ]
    : [
        {
          url: liveUrl,
          description: 'Live Production Server (Render Deployed API)'
        },
        {
          url: localUrl,
          description: 'Local Development Server'
        }
      ];

  return {
    openapi: '3.0.3',
    info: {
      title: 'KrishiDirect Agri Marketplace REST API',
      version: '1.0.0',
      description: `
### 🌾 Direct Farmer-to-Consumer Agri Marketplace API Engine

KrishiDirect connects agricultural producers directly with local consumers, eliminating middlemen markups and providing verified organic traceability.

#### Key Features:
* **JWT Bearer Authentication**: Role-based access control (\`consumer\`, \`farmer\`, \`admin\`).
* **Produce Inventory Management**: Traceable harvesting dates, stock status, organic certification.
* **Robust Order Lifecycle**: State machine transitions with anti-race-condition stock validation.
* **Farmer Panel & Analytics**: Sales breakdowns, payout reports, and dashboard metrics.
* **Admin Platform Oversight**: KYC verification of farmers, product moderation, platform commission configuration.
* **Verified Purchase Reviews**: Only consumers with delivered orders can submit feedback.

#### How to Authenticate:
1. Call \`POST /api/auth/login\` (or \`POST /api/auth/register\`) to obtain a JWT token.
2. Click the **Authorize 🔓** button at the top right of this page.
3. Paste the token into the **Value** box (e.g. \`eyJhbGciOi...\`) and click **Authorize**.
4. Protected endpoints will now automatically transmit the \`Authorization: Bearer <token>\` header.
      `,
      contact: {
        name: 'KrishiDirect Engineering Support',
        url: 'https://krishidirect-api.onrender.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers,
    tags: [
      { name: 'Authentication', description: 'User registration, login, profile management, and Google OAuth' },
      { name: 'Products', description: 'Marketplace produce catalog, listing creation, inventory updates, and deletion' },
      { name: 'Orders', description: 'Order placement, lifecycle state transitions, disputes, and cancellations' },
      { name: 'Farmers', description: 'Farmer profiles, verified catalogs, dashboard metrics, and sales reports' },
      { name: 'Admin', description: 'Platform oversight, farmer verification, user management, and commission control' },
      { name: 'Reviews', description: 'Verified buyer ratings and customer feedback management' },
      { name: 'System & Health', description: 'API health checks and operational status' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token obtained from `/api/auth/login` or `/api/auth/register`'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Operation failed or invalid input.' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            label: { type: 'string', example: 'Home' },
            addressLine: { type: 'string', example: '123 Farm View Road' },
            city: { type: 'string', example: 'Pune' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', example: '411001' },
            isDefault: { type: 'boolean', example: true }
          },
          required: ['addressLine', 'city', 'state', 'pincode']
        },
        BankDetails: {
          type: 'object',
          properties: {
            accountHolder: { type: 'string', example: 'Ramesh Patil' },
            accountNumber: { type: 'string', example: '987654321098' },
            ifscCode: { type: 'string', example: 'SBIN0001234' },
            upiId: { type: 'string', example: 'ramesh.farmer@upi' }
          }
        },
        FarmDetails: {
          type: 'object',
          properties: {
            farmName: { type: 'string', example: 'Patil Organic Agro' },
            farmLocation: { type: 'string', example: 'Baramati, Pune' },
            state: { type: 'string', example: 'Maharashtra' },
            district: { type: 'string', example: 'Pune' },
            sizeInAcres: { type: 'number', example: 8.5 },
            primaryCrops: {
              type: 'array',
              items: { type: 'string' },
              example: ['Alphonso Mangoes', 'Organic Tomatoes', 'Baby Spinach']
            },
            farmingMethod: { type: 'string', example: 'Organic' },
            isOrganicCertified: { type: 'boolean', example: true },
            certificationNumber: { type: 'string', example: 'NPOP/NAB/0019/2026' },
            bio: { type: 'string', example: 'Dedicated to chemical-free sustainable organic farming.' },
            verificationStatus: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected'],
              example: 'verified'
            },
            verificationNotes: { type: 'string', example: 'Documents reviewed and approved by platform admin.' },
            bankDetails: { $ref: '#/components/schemas/BankDetails' },
            rating: { type: 'number', example: 4.9 },
            reviewCount: { type: 'number', example: 28 },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef']
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '661fa5b12a8f9024b108cf11' },
            name: { type: 'string', example: 'Ramesh Patil' },
            email: { type: 'string', format: 'email', example: 'ramesh.farmer@example.com' },
            phone: { type: 'string', example: '+91 9876543210' },
            role: { type: 'string', enum: ['consumer', 'farmer', 'admin'], example: 'farmer' },
            avatar: { type: 'string', example: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
            farmDetails: { $ref: '#/components/schemas/FarmDetails' },
            addresses: {
              type: 'array',
              items: { $ref: '#/components/schemas/Address' }
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661fa5b12a8f9024b108cf22' },
            title: { type: 'string', example: 'Farm Fresh Alphonso Mangoes' },
            farmer: { type: 'string', example: '661fa5b12a8f9024b108cf11' },
            farmerName: { type: 'string', example: 'Ramesh Patil' },
            farmName: { type: 'string', example: 'Patil Organic Agro' },
            category: {
              type: 'string',
              enum: ['Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'],
              example: 'Fruits'
            },
            price: { type: 'number', example: 450 },
            unit: { type: 'string', example: 'dozen' },
            availableQuantity: { type: 'number', example: 120 },
            minOrderQuantity: { type: 'number', example: 1 },
            harvestDate: { type: 'string', format: 'date-time' },
            shelfLifeDays: { type: 'number', example: 7 },
            isOrganic: { type: 'boolean', example: true },
            farmingMethod: { type: 'string', example: 'Organic Certified' },
            organicCertNo: { type: 'string', example: 'NPOP/NAB/0019/2026' },
            description: { type: 'string', example: 'Naturally ripened carbide-free Ratnagiri Alphonso mangoes.' },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://images.unsplash.com/photo-1553279768-865429fa0078']
            },
            originLocation: { type: 'string', example: 'Ratnagiri, Maharashtra' },
            status: {
              type: 'string',
              enum: ['in_stock', 'low_stock', 'out_of_stock', 'unlisted'],
              example: 'in_stock'
            },
            rating: { type: 'number', example: 4.9 },
            numReviews: { type: 'number', example: 18 },
            featured: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            product: { type: 'string', example: '661fa5b12a8f9024b108cf22' },
            title: { type: 'string', example: 'Farm Fresh Alphonso Mangoes' },
            price: { type: 'number', example: 450 },
            unit: { type: 'string', example: 'dozen' },
            quantity: { type: 'number', example: 2 },
            farmer: { type: 'string', example: '661fa5b12a8f9024b108cf11' },
            farmerName: { type: 'string', example: 'Ramesh Patil' },
            farmName: { type: 'string', example: 'Patil Organic Agro' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661fa5b12a8f9024b108cf33' },
            orderNumber: { type: 'string', example: 'ORD-2026-894125' },
            consumer: { type: 'string', example: '661fa5b12a8f9024b108cf44' },
            consumerName: { type: 'string', example: 'Anita Sharma' },
            consumerPhone: { type: 'string', example: '+91 9988776655' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            deliveryAddress: { $ref: '#/components/schemas/Address' },
            subtotal: { type: 'number', example: 900 },
            deliveryFee: { type: 'number', example: 50 },
            platformFee: { type: 'number', example: 15 },
            totalAmount: { type: 'number', example: 965 },
            paymentMethod: {
              type: 'string',
              enum: ['upi', 'card', 'cod', 'netbanking'],
              example: 'upi'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
              example: 'paid'
            },
            orderStatus: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'DISPUTED'],
              example: 'PENDING'
            },
            disputeDetails: {
              type: 'object',
              properties: {
                isDisputed: { type: 'boolean', example: false },
                reason: { type: 'string' },
                status: { type: 'string', enum: ['open', 'resolved', 'closed'] },
                raisedBy: { type: 'string' },
                raisedAt: { type: 'string', format: 'date-time' },
                resolutionNote: { type: 'string' },
                resolvedAt: { type: 'string', format: 'date-time' }
              }
            },
            statusHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'PENDING' },
                  timestamp: { type: 'string', format: 'date-time' },
                  note: { type: 'string', example: 'Order placed by consumer' }
                }
              }
            },
            deliverySlot: { type: 'string', example: 'Morning Express (06:00 AM - 09:00 AM)' },
            estimatedDeliveryDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661fa5b12a8f9024b108cf55' },
            targetType: { type: 'string', enum: ['product', 'farmer'], example: 'product' },
            product: { type: 'string', example: '661fa5b12a8f9024b108cf22' },
            farmer: { type: 'string', example: '661fa5b12a8f9024b108cf11' },
            consumer: { type: 'string', example: '661fa5b12a8f9024b108cf44' },
            consumerName: { type: 'string', example: 'Anita Sharma' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent quality fresh mangoes straight from the orchard!' },
            isVerifiedPurchaser: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Check API service health',
          description: 'Returns operational status, deployment environment, and current timestamp.',
          tags: ['System & Health'],
          responses: {
            200: {
              description: 'Service is operational',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      service: { type: 'string', example: 'Agri Marketplace API Engine' },
                      timestamp: { type: 'string', format: 'date-time' },
                      environment: { type: 'string', example: 'production' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Root health check endpoint',
          description: 'Alias for /api/health used by cloud load balancers and container orchestrators.',
          tags: ['System & Health'],
          responses: {
            200: {
              description: 'Service is operational',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      service: { type: 'string', example: 'Agri Marketplace API Engine' },
                      timestamp: { type: 'string', format: 'date-time' },
                      environment: { type: 'string', example: 'production' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new consumer or farmer',
          description: 'Creates a new platform user account. If role is `farmer`, farm details must be supplied and the account initiates in `pending` verification status.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'phone'],
                  properties: {
                    name: { type: 'string', minLength: 2, example: 'Ramesh Patil' },
                    email: { type: 'string', format: 'email', example: 'ramesh.farmer@example.com' },
                    password: { type: 'string', minLength: 6, example: 'FarmerPass123#' },
                    confirmPassword: { type: 'string', example: 'FarmerPass123#' },
                    phone: { type: 'string', minLength: 8, example: '+91 9876543210' },
                    role: { type: 'string', enum: ['consumer', 'farmer'], default: 'consumer', example: 'farmer' },
                    farmDetails: {
                      type: 'object',
                      required: ['farmName', 'farmLocation'],
                      properties: {
                        farmName: { type: 'string', example: 'Patil Organic Agro' },
                        farmLocation: { type: 'string', example: 'Baramati, Pune' },
                        state: { type: 'string', example: 'Maharashtra' },
                        district: { type: 'string', example: 'Pune' },
                        sizeInAcres: { type: 'number', example: 5 },
                        cropTypes: { type: 'string', example: 'Mangoes, Vegetables, Grains' },
                        farmingMethod: { type: 'string', enum: ['Organic', 'Conventional'], example: 'Organic' },
                        isOrganicCertified: { type: 'boolean', example: true },
                        certificationNumber: { type: 'string', example: 'NPOP/2026/0129' },
                        bio: { type: 'string', example: 'Naturally cultivated produce with direct farm dispatch.' }
                      }
                    },
                    addresses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Address' }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Farmer registration successful! Your farm profile has been submitted for admin verification approval.' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Validation error or email already in use',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Sign in with email and password',
          description: 'Authenticates credentials and returns a signed JWT token valid for 7 days.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'ramesh.farmer@example.com' },
                    password: { type: 'string', example: 'FarmerPass123#' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Welcome back, Ramesh Patil!' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Missing email or password',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            401: {
              description: 'Invalid credentials or deactivated account',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/auth/google': {
        post: {
          summary: 'Authenticate or register via Google SSO',
          description: 'Validates Google OAuth profile information and signs in the user.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'consumer@gmail.com' },
                    name: { type: 'string', example: 'Aarav Mehta' },
                    avatar: { type: 'string', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
                    role: { type: 'string', enum: ['consumer', 'farmer'], default: 'consumer', example: 'consumer' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Google authentication successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Welcome, Aarav Mehta! Authenticated with Google.' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Missing Google email',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            403: {
              description: 'Admin accounts cannot use Google SSO',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current authenticated user profile',
          description: 'Retrieves the sanitized profile of the user identified by the Bearer token.',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current profile retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized / invalid or expired token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/auth/profile': {
        put: {
          summary: 'Update current user profile',
          description: 'Allows updating name, phone number, saved delivery addresses, and farm details.',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Ramesh Patil' },
                    phone: { type: 'string', example: '+91 9876543210' },
                    addresses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Address' }
                    },
                    farmDetails: {
                      type: 'object',
                      properties: {
                        farmName: { type: 'string', example: 'Patil Organic Agro' },
                        farmLocation: { type: 'string', example: 'Baramati, Pune' },
                        bio: { type: 'string', example: 'Updated organic farm bio notes.' }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Profile updated successfully' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/products': {
        get: {
          summary: 'Search & filter marketplace produce listings',
          description: 'Public catalog query with full-text search, category filters, sorting, and pagination.',
          tags: ['Products'],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string', enum: ['Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'] } },
            { name: 'isOrganic', in: 'query', schema: { type: 'boolean' }, description: 'Filter by organic certification' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword text search' },
            { name: 'farmerId', in: 'query', schema: { type: 'string' }, description: 'Filter products by specific farmer ID' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock', 'unlisted'] }, default: 'in_stock' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating'] }, default: 'newest' },
            { name: 'location', in: 'query', schema: { type: 'string' } },
            { name: 'farmingMethod', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } }
          ],
          responses: {
            200: {
              description: 'List of matching products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 12 },
                      products: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new produce listing',
          description: 'Restricted to verified farmers and platform admins.',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'category', 'price', 'availableQuantity', 'description'],
                  properties: {
                    title: { type: 'string', example: 'Fresh Organic Spinach (Palak)' },
                    category: { type: 'string', enum: ['Fruits', 'Vegetables', 'Grains & Pulses', 'Dairy & Poultry', 'Organic & Special'], example: 'Vegetables' },
                    price: { type: 'number', minimum: 0.1, example: 35 },
                    unit: { type: 'string', default: 'kg', example: 'bunch' },
                    availableQuantity: { type: 'number', minimum: 0, example: 50 },
                    minOrderQuantity: { type: 'number', default: 1, example: 1 },
                    harvestDate: { type: 'string', format: 'date-time' },
                    shelfLifeDays: { type: 'number', default: 7, example: 4 },
                    isOrganic: { type: 'boolean', default: false, example: true },
                    farmingMethod: { type: 'string', example: 'Zero Budget Natural Farming' },
                    organicCertNo: { type: 'string', example: 'ZBNF-MH-2026' },
                    description: { type: 'string', example: 'Harvested at dawn, pesticide-free crisp green spinach.' },
                    images: { type: 'array', items: { type: 'string' }, example: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb'] },
                    originLocation: { type: 'string', example: 'Baramati, Pune' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Listing created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Produce listed successfully on KrishiDirect Marketplace!' },
                      product: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Missing required produce details or invalid prices',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            403: {
              description: 'Forbidden: Requires verified farmer status or admin role',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/products/{id}': {
        get: {
          summary: 'Get produce listing details by ID',
          description: 'Public endpoint returning product information alongside buyer reviews and rating aggregations.',
          tags: ['Products'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ObjectId' }
          ],
          responses: {
            200: {
              description: 'Produce details with reviews',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      product: { $ref: '#/components/schemas/Product' },
                      reviews: {
                        type: 'object',
                        properties: {
                          averageRating: { type: 'number', example: 4.8 },
                          totalReviews: { type: 'number', example: 15 },
                          reviews: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Review' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Produce listing not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        put: {
          summary: 'Update produce listing',
          description: 'Updates mutable produce details. Only the listing owner (verified farmer) or an admin can perform updates.',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated Alphonso Mangoes' },
                    price: { type: 'number', example: 480 },
                    availableQuantity: { type: 'number', example: 95 },
                    description: { type: 'string', example: 'Fresh batch picked this morning.' },
                    status: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock', 'unlisted'] }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Produce listing updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Produce listing updated successfully.' },
                      product: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden: Ownership mismatch or unverified farmer',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Product not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        delete: {
          summary: 'Deactivate / unlist a produce listing',
          description: 'Sets status to `unlisted`. Listing farmer or platform admin only.',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Produce unlisted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Produce listing deactivated/unlisted from marketplace.' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Product not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/products/{id}/inventory': {
        patch: {
          summary: 'Quick update for product inventory and stock status',
          description: 'Allows farmers to rapidly update available stock levels or mark as out of stock.',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    availableQuantity: { type: 'number', minimum: 0, example: 80 },
                    status: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock'] }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Inventory updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Produce inventory updated successfully.' },
                      product: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid inventory values',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/orders': {
        post: {
          summary: 'Place a new direct-from-farm order',
          description: 'Validates inventory stock concurrently, calculates authoritative subtotal and fees, and reserves stock.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'deliveryAddress'],
                  properties: {
                    items: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['productId', 'quantity'],
                        properties: {
                          productId: { type: 'string', example: '661fa5b12a8f9024b108cf22' },
                          quantity: { type: 'number', minimum: 1, example: 2 }
                        }
                      }
                    },
                    deliveryAddress: { $ref: '#/components/schemas/Address' },
                    paymentMethod: { type: 'string', enum: ['upi', 'card', 'cod', 'netbanking'], default: 'upi', example: 'upi' },
                    deliverySlot: { type: 'string', default: 'Morning Express (06:00 AM - 09:00 AM)', example: 'Morning Express (06:00 AM - 09:00 AM)' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Order placed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order placed successfully! Fresh farm harvest will be packed shortly.' },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Cart empty, invalid address, or insufficient stock',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Product in cart no longer exists',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        },
        get: {
          summary: 'Get orders list',
          description: 'Automatically scoped by user role: consumers see their purchases; farmers see incoming orders containing their produce; admins see all platform orders.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'DISPUTED'] }, description: 'Filter orders by status' }
          ],
          responses: {
            200: {
              description: 'Orders list retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 5 },
                      orders: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Order' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/orders/{id}': {
        get: {
          summary: 'Get single order details by ID',
          description: 'Authorized for the buyer consumer, the participating farmers, or an admin.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Order details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden: You are not authorized to view this order',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            404: {
              description: 'Order not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/orders/{id}/status': {
        patch: {
          summary: 'Progress order through state machine lifecycle',
          description: 'Executed by verified farmers or platform admins. Follows strict transition sequence: PENDING -> CONFIRMED -> PREPARING -> READY_FOR_DELIVERY -> OUT_FOR_DELIVERY -> DELIVERED.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED'],
                      example: 'CONFIRMED'
                    },
                    note: { type: 'string', example: 'Harvest packed into eco-crates and handed to delivery courier.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order status transitioned from PENDING to CONFIRMED.' },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Illegal state machine transition',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            403: {
              description: 'Forbidden: Order does not contain produce from caller farm',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/orders/{id}/cancel': {
        post: {
          summary: 'Cancel order and restore inventory',
          description: 'Consumers can cancel PENDING or CONFIRMED orders; farmers and admins can cancel prior to delivery. Stock quantities are automatically restored.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reason: { type: 'string', example: 'Requested cancellation due to travel schedule change.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Order cancelled and stock restored',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order cancelled successfully and inventory stock restored.' },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Order cannot be cancelled in current state (e.g. already delivered)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/orders/{id}/dispute': {
        post: {
          summary: 'Raise dispute ticket for an order',
          description: 'Consumers can raise a dispute for orders in OUT_FOR_DELIVERY or DELIVERED status (e.g. damaged produce, missing items).',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reason'],
                  properties: {
                    reason: { type: 'string', example: 'Produce was bruised upon delivery arrival.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Dispute ticket registered',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Dispute ticket submitted successfully. Platform admin will review and resolve.' },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid dispute parameters or state',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/orders/{id}/resolve-dispute': {
        post: {
          summary: 'Resolve customer dispute (Admin only)',
          description: 'Platform administrators can either issue a full refund (restoring stock) or close the claim.',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['refund', 'close'], example: 'refund' },
                    resolutionNote: { type: 'string', example: 'Full refund credited to consumer UPI ID.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Dispute resolved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Dispute resolved with full refund. Inventory restored.' },
                      order: { $ref: '#/components/schemas/Order' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid resolution action or order not in DISPUTED state',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            403: {
              description: 'Forbidden: Requires Admin role',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/farmers': {
        get: {
          summary: 'Catalog of verified farmers',
          description: 'Public directory of all platform farmers whose accounts have been verified by admin.',
          tags: ['Farmers'],
          responses: {
            200: {
              description: 'List of verified farmers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 8 },
                      farmers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            avatar: { type: 'string' },
                            farmDetails: { $ref: '#/components/schemas/FarmDetails' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/farmers/list/all': {
        get: {
          summary: 'Alias: Catalog of verified farmers',
          tags: ['Farmers'],
          responses: {
            200: {
              description: 'List of verified farmers',
              content: { 'application/json': { schema: { type: 'object' } } }
            }
          }
        }
      },
      '/api/farmers/me': {
        get: {
          summary: 'Get current farmer panel profile',
          description: 'Returns private farm details, payout bank accounts, and verification status for the authenticated farmer.',
          tags: ['Farmers'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Farmer profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      farmer: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden: Requires farmer role',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/farmers/profile': {
        get: {
          summary: 'Alias: Get current farmer profile',
          tags: ['Farmers'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Farmer profile' } }
        },
        put: {
          summary: 'Update farm profile and credentials',
          description: 'Allows farmers to update farm location, acreage, primary crops, farming method, bio, and bank details.',
          tags: ['Farmers'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Ramesh Patil' },
                    phone: { type: 'string', example: '+91 9876543210' },
                    avatar: { type: 'string' },
                    farmName: { type: 'string', example: 'Patil Organic Agro' },
                    farmLocation: { type: 'string', example: 'Baramati, Pune' },
                    state: { type: 'string', example: 'Maharashtra' },
                    district: { type: 'string', example: 'Pune' },
                    sizeInAcres: { type: 'number', example: 10 },
                    primaryCrops: { type: 'array', items: { type: 'string' }, example: ['Alphonso Mangoes', 'Spinach', 'Okra'] },
                    farmingMethod: { type: 'string', example: 'Organic Certified' },
                    isOrganicCertified: { type: 'boolean', example: true },
                    certificationNumber: { type: 'string', example: 'NPOP/2026/0129' },
                    bio: { type: 'string', example: 'Organic farm producing fresh seasonal harvests.' },
                    bankDetails: { $ref: '#/components/schemas/BankDetails' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Farmer profile updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Farmer profile updated successfully.' },
                      farmer: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/farmers/dashboard': {
        get: {
          summary: 'Farmer operational dashboard metrics',
          description: 'Real-time overview of active deliveries, pending orders, net platform earnings, stock counts, and recent orders.',
          tags: ['Farmers'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard metrics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      metrics: {
                        type: 'object',
                        properties: {
                          totalOrders: { type: 'integer', example: 42 },
                          pendingOrders: { type: 'integer', example: 3 },
                          activeDeliveries: { type: 'integer', example: 7 },
                          completedOrders: { type: 'integer', example: 32 },
                          totalEarnings: { type: 'number', example: 48500 },
                          totalProducts: { type: 'integer', example: 8 },
                          activeProducts: { type: 'integer', example: 6 },
                          lowStockCount: { type: 'integer', example: 1 },
                          outOfStockCount: { type: 'integer', example: 1 }
                        }
                      },
                      recentOrders: { type: 'array', items: { type: 'object' } },
                      productsList: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/farmers/sales': {
        get: {
          summary: 'Farmer sales analytics & revenue timeline',
          description: 'Calculates gross sales, 5% platform commission fees, net payout earnings, best-selling crops, and chronological timeline.',
          tags: ['Farmers'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'period', in: 'query', schema: { type: 'string', enum: ['today', '7days', '30days', 'custom'], default: '30days' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
          ],
          responses: {
            200: {
              description: 'Sales summary analytics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      period: { type: 'string', example: '30days' },
                      summary: {
                        type: 'object',
                        properties: {
                          grossSales: { type: 'number', example: 52000 },
                          platformFee: { type: 'number', example: 2600 },
                          netEarnings: { type: 'number', example: 49400 },
                          completedOrders: { type: 'integer', example: 32 },
                          pendingOrders: { type: 'integer', example: 3 },
                          activeOrders: { type: 'integer', example: 7 },
                          totalUnitsSold: { type: 'number', example: 240 },
                          avgOrderValue: { type: 'number', example: 1625 },
                          commissionRatePercent: { type: 'number', example: 5 }
                        }
                      },
                      topProducts: { type: 'array', items: { type: 'object' } },
                      timeline: { type: 'array', items: { type: 'object' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/farmers/{id}': {
        get: {
          summary: 'Public farm profile page for consumers',
          description: 'Returns the farmer public profile and all active in-stock produce listings available for purchase.',
          tags: ['Farmers'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Farmer profile and in-stock produce catalog',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      farmer: { type: 'object' },
                      products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Farmer profile not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/admin/dashboard': {
        get: {
          summary: 'Admin platform overview dashboard',
          description: 'Comprehensive platform statistics: total users, pending KYC verification queues, active products, recent orders, and commission settings.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Admin dashboard dataset',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      metrics: { type: 'object' },
                      farmers: { type: 'array', items: { type: 'object' } },
                      products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                      pendingFarmers: { type: 'array', items: { type: 'object' } },
                      commission: { type: 'object' },
                      recentOrders: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Forbidden: Requires Admin role',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/admin/users': {
        get: {
          summary: 'List all registered platform users',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['consumer', 'farmer', 'admin'] } }
          ],
          responses: {
            200: {
              description: 'Users list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 25 },
                      users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/admin/users/{userId}/status': {
        patch: {
          summary: 'Activate or deactivate a user account',
          description: 'Allows platform admins to disable suspended accounts. Admins cannot deactivate their own profile.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['isActive'],
                  properties: {
                    isActive: { type: 'boolean', example: false }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'User status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: "User account 'Ramesh Patil' status set to Deactivated." },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Self-deactivation attempt or invalid parameters',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/admin/farmers/{farmerId}/verify': {
        patch: {
          summary: 'Verify or reject farmer KYC onboarding',
          description: 'Farmers must be approved by an administrator before they can list produce on the marketplace.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'farmerId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['verified', 'rejected', 'pending'], example: 'verified' },
                    notes: { type: 'string', example: 'Land ownership record and organic certification verified.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Farmer verification status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: "Farmer 'Ramesh Patil' verification status set to 'verified'." },
                      farmer: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid status value',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/admin/products/{productId}/moderate': {
        patch: {
          summary: 'Moderate marketplace produce listing status',
          description: 'Admins can change produce listing visibility (`in_stock`, `unlisted`, `out_of_stock`, `low_stock`).',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['in_stock', 'unlisted', 'out_of_stock', 'low_stock'], example: 'unlisted' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Product moderation status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: "Product 'Organic Tomatoes' moderation status updated to 'unlisted'." },
                      product: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/admin/commission': {
        post: {
          summary: 'Update platform fee commission percentage',
          description: 'Configures default platform commission retained on farm sales.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['commissionRatePercent'],
                  properties: {
                    commissionRatePercent: { type: 'number', minimum: 0, maximum: 50, example: 5 }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Commission updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Platform commission rate updated to 5%.' },
                      commission: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/reviews': {
        post: {
          summary: 'Submit or update verified purchase review',
          description: 'Only consumers who have completed purchases of the item or farmer produce can submit reviews.',
          tags: ['Reviews'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rating', 'comment'],
                  properties: {
                    productId: { type: 'string', example: '661fa5b12a8f9024b108cf22' },
                    farmerId: { type: 'string', example: '661fa5b12a8f9024b108cf11' },
                    targetType: { type: 'string', enum: ['product', 'farmer'], example: 'product' },
                    rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                    comment: { type: 'string', example: 'Super fresh and sweet Alphonso mangoes, delivered fast!' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Review created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Thank you! Your verified purchase review has been published.' },
                      review: { $ref: '#/components/schemas/Review' }
                    }
                  }
                }
              }
            },
            200: {
              description: 'Review updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Your verified purchase review has been updated successfully.' },
                      review: { $ref: '#/components/schemas/Review' }
                    }
                  }
                }
              }
            },
            403: {
              description: 'Ineligible to review or not a consumer role',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/api/reviews/eligibility': {
        get: {
          summary: 'Check if current consumer is eligible to review',
          tags: ['Reviews'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'productId', in: 'query', schema: { type: 'string' } },
            { name: 'farmerId', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Review eligibility status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      eligible: { type: 'boolean', example: true },
                      reason: { type: 'string', nullable: true },
                      existingReview: { $ref: '#/components/schemas/Review' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/reviews/product/{productId}': {
        get: {
          summary: 'Get all reviews for a specific produce item',
          description: 'Public endpoint. If Bearer token is provided, returns the caller existing review as well.',
          tags: ['Reviews'],
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Product reviews dataset',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      averageRating: { type: 'number', example: 4.8 },
                      totalReviews: { type: 'integer', example: 12 },
                      reviews: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Review' }
                      },
                      userReview: { $ref: '#/components/schemas/Review', nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/reviews/farmer/{farmerId}': {
        get: {
          summary: 'Get all reviews for a specific farmer',
          description: 'Public endpoint. If Bearer token is provided, returns the caller existing review as well.',
          tags: ['Reviews'],
          parameters: [
            { name: 'farmerId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Farmer reviews dataset',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      averageRating: { type: 'number', example: 4.9 },
                      totalReviews: { type: 'integer', example: 28 },
                      reviews: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Review' }
                      },
                      userReview: { $ref: '#/components/schemas/Review', nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
};

module.exports = { getSwaggerSpec };
