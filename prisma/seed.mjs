import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'WAREHOUSE_VIEWER'];
const categories = [
  ['stakanlar-va-qopqoqlar', 'Стаканы и крышки', 'Stakanlar va qopqoqlar'],
  ['bir-martalik-idishlar', 'Одноразовая посуда', 'Bir martalik idishlar'],
  ['ovqat-konteynerlari', 'Контейнеры для еды', 'Ovqat konteynerlari'],
  ['sous-idishlari', 'Соусники', 'Sous idishlari'],
  ['kraft-paketlar', 'Крафт-пакеты', 'Kraft paketlar'],
  ['polietilen-paketlar', 'Полиэтиленовые пакеты', 'Polietilen paketlar'],
  ['zip-paketlar', 'Zip-пакеты', 'Zip paketlar'],
  ['chiqindi-paketlari', 'Мешки для мусора', 'Chiqindi paketlari'],
  ['streych-plyonkalar', 'Стрейч-плёнка', 'Streych plyonkalar'],
  ['oziq-ovqat-plyonkasi', 'Пищевая плёнка', 'Oziq-ovqat plyonkasi'],
  ['folga-va-pergament', 'Фольга и пергамент', 'Folga va pergament'],
  ['qandolatchilik-qadoqlari', 'Кондитерская упаковка', 'Qandolatchilik qadoqlari'],
  ['bir-martalik-qoshiq-vilka', 'Одноразовые приборы', 'Bir martalik qoshiq-vilka'],
  ['salfetka-va-qogoz', 'Салфетки и бумажные товары', 'Salfetka va qog‘oz mahsulotlari'],
  ['xojalik-sarf-materiallari', 'Хозяйственные расходные материалы', 'Xo‘jalik sarf materiallari'],
  ['bayram-mahsulotlari', 'Праздничные товары', 'Bayram mahsulotlari'],
  ['yangi-yil-paketlari', 'Новогодние пакеты и коробки', 'Yangi yil paketlari va qutilari'],
];

async function main() {
  for (const code of roles) {
    await db.role.upsert({ where: { code }, update: {}, create: { code } });
  }

  for (const [slug, ru, uz] of categories) {
    const category = await db.category.upsert({
      where: { slugUz: slug },
      update: { active: true },
      create: { slugUz: slug, slugRu: `${slug}-ru`, active: true },
    });
    await db.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: 'uz' } },
      update: { name: uz },
      create: { categoryId: category.id, locale: 'uz', name: uz },
    });
    await db.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: 'ru' } },
      update: { name: ru },
      create: { categoryId: category.id, locale: 'ru', name: ru },
    });
  }

  const settings = {
    phone: '+998996448444',
    telegramUsername: 'paketshopuz',
    defaultLocale: 'uz',
    supportedLocales: ['uz', 'ru'],
    onlinePaymentsEnabled: false,
  };
  await db.siteSetting.upsert({
    where: { key: 'public_contact' },
    update: { value: settings },
    create: { key: 'public_contact', value: settings },
  });

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
    const role = await db.role.findUniqueOrThrow({ where: { code: 'SUPER_ADMIN' } });
    const user = await db.user.upsert({
      where: { email },
      update: { active: true },
      create: { email, passwordHash: await hash(password, 12), active: true },
    });
    await db.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
