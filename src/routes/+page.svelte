<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if (browser) {
		let token = document.cookie.split('; ').find((row) => row.startsWith('accessToken='));
		// Extract the token value, from state, or from localStorage
		if (!token) {
			goto('/login');
		} else {
			// get user info
			
			goto('/home');
		}
	}
</script>

<p>Site en construction</p>
