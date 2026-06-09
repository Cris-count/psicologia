export interface TeacherNavItem {
  id: string;
  label: string;
  route: string;
  iconUrl: string;
  exact?: boolean;
}

export const TEACHER_NAV_ICON_VERSION = '3';

export const TEACHER_NAV_ITEMS: TeacherNavItem[] = [
  {
    id: 'resumen',
    label: 'Resumen',
    route: '/teacher/resumen',
    iconUrl: '/assets/ui/teacher-nav/resumen.png?v=3',
    exact: true,
  },
  {
    id: 'casos',
    label: 'Casos psicológicos',
    route: '/teacher/casos',
    iconUrl: '/assets/ui/teacher-nav/casos.png?v=3',
  },
  {
    id: 'grupos',
    label: 'Grupos',
    route: '/teacher/grupos',
    iconUrl: '/assets/ui/teacher-nav/grupos.png?v=3',
  },
  {
    id: 'estudiantes',
    label: 'Estudiantes',
    route: '/teacher/estudiantes',
    iconUrl: '/assets/ui/teacher-nav/estudiantes.png?v=3',
  },
  {
    id: 'tareas',
    label: 'Tareas',
    route: '/teacher/tareas',
    iconUrl: '/assets/ui/teacher-nav/tareas.png?v=3',
  },
  {
    id: 'resultados',
    label: 'Resultados',
    route: '/teacher/resultados',
    iconUrl: '/assets/ui/teacher-nav/resultados.svg?v=3',
  },
  {
    id: 'perfil',
    label: 'Mi perfil',
    route: '/teacher/perfil',
    iconUrl: '/assets/ui/teacher-nav/perfil.png?v=3',
  },
];
