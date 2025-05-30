import { getUser, getUsers } from "@/app/server/db/users";
import EditUserForm from "@/components/edit-user-form";
import { Pages, Routes } from "@/constants/enums";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ✅ توليد المسارات الثابتة لجميع المستخدمين
export async function generateStaticParams() {
  const users = await getUsers();
  return users.map((user) => ({ userId: user.id }));
}

// ✅ صفحة تعديل المستخدم
export default async function EditUserPage({ params }: Props) {
  const { userId } = await params;

  // إحضار بيانات المستخدم بناءً على userId
  const user = await getUser(userId);

  // إعادة التوجيه إذا لم يتم العثور على المستخدم
  if (!user) {
    redirect(`/${Routes.ADMIN}/${Pages.USERS}`);
  }

  return (
    <main className="min-h-screen bg-black">
      <section className="section-gap py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-indigo-700 mb-6">
            Edit User - {user.name}
          </h1>
          <EditUserForm user={user as any} />
        </div>
      </section>
    </main>
  );
}
