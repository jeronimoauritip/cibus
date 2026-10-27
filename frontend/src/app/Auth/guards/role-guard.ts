import { inject } from '@angular/core'
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router'
import { AuthService } from '../services/auth-service'
import { RoleModel } from '../../Roles/role-model'


export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService)
  const router = inject(Router)

  const permitRoles = route.data['roles'] as RoleModel['role'][] | undefined
  const role = auth.role()

  if (permitRoles?.length && role && permitRoles.includes(role)) {
    return true
  }

  return router.createUrlTree(['/tables'])
}
