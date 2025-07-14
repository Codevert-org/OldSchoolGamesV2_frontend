<script>
	import { goto } from "$app/navigation";
    import { browser } from '$app/environment';

    if(browser) {
        let token = localStorage.getItem("accessToken");
        if (!localStorage || !token) {
            goto("/login");
        }
        else {
            goto("/home");
        }
    }

</script>

<p>Site en construction</p>
